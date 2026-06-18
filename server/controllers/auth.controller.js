import { registerUser, loginUser } from '../services/auth.service.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
};

export const register = async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const profile = await registerUser(data);
    res.status(201).json({ success: true, data: profile });
  } catch (err) { next(err); }
};

export const login = async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const { token, profile } = await loginUser(data);
    res.cookie('token', token, COOKIE_OPTIONS);
    res.json({ success: true, data: { profile } });
  } catch (err) { next(err); }
};

export const logout = (_req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'strict' });
  res.json({ success: true, data: null });
};

export const getMe = async (req, res) => {
  // req.user is set by protect middleware
  res.json({ success: true, data: req.user });
};
