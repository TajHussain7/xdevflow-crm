import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

/**
 * protect — Verify JWT and attach user profile to req.user.
 * Reads token from:
 *   1. HttpOnly cookie named 'token'
 *   2. Authorization: Bearer <token> header
 */
export const protect = async (req, res, next) => {
  const token =
    req.cookies?.token ||
    req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, role')
      .eq('id', decoded.id)
      .single();

    if (error || !profile) {
      return res.status(401).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User no longer exists' },
      });
    }

    req.user = profile;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Token is invalid or expired' },
    });
  }
};
