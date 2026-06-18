import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

/**
 * Register a new user via Supabase Auth and insert a profile row.
 * The trigger `on_auth_user_created` also creates the profile, but we insert
 * explicitly here so we can set the role and return it immediately.
 */
export const registerUser = async ({ full_name, email, password, role = 'user' }) => {
  // Create Supabase Auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // skip email confirmation for dev
    user_metadata: { full_name, role },
  });

  if (authError) {
    const err = new Error(authError.message);
    err.statusCode = authError.status || 400;
    err.code = 'AUTH_ERROR';
    throw err;
  }

  // Upsert profile (trigger may have already created it)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .upsert({ id: authData.user.id, full_name, email, role }, { onConflict: 'id' })
    .select('id, full_name, email, role, created_at')
    .single();

  if (profileError) {
    const err = new Error(profileError.message);
    err.statusCode = 400;
    err.code = 'PROFILE_ERROR';
    throw err;
  }

  return profile;
};

/**
 * Authenticate user with Supabase, then issue a custom JWT.
 */
export const loginUser = async ({ email, password }) => {
  // Authenticate via Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData?.user) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    err.code = 'INVALID_CREDENTIALS';
    throw err;
  }

  // Fetch profile to get role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .eq('id', authData.user.id)
    .single();

  if (profileError || !profile) {
    const err = new Error('User profile not found.');
    err.statusCode = 404;
    err.code = 'PROFILE_NOT_FOUND';
    throw err;
  }

  // Sign our own JWT (stored in HttpOnly cookie, used for Express API)
  const token = jwt.sign(
    { id: profile.id, role: profile.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  return { token, profile };
};
