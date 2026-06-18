/**
 * Global Express error handler.
 * Must have 4 parameters (err, req, res, next) to be treated as error middleware.
 */
export const errorHandler = (err, _req, res, _next) => {
  console.error('[ERROR]', err.name, err.message);

  // ── Zod validation errors ────────────────────
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      error: {
        code:    'VALIDATION_ERROR',
        message: 'Validation failed',
        details: err.errors.map((e) => ({
          field:   e.path.join('.'),
          message: e.message,
        })),
      },
    });
  }

  // ── JWT errors ───────────────────────────────
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Token is invalid or expired' },
    });
  }

  // ── Application-level errors (statusCode set by service) ──
  const statusCode = err.statusCode || 500;
  const errorCode  = err.code       || 'INTERNAL_SERVER_ERROR';
  const message    = err.message    || 'An unexpected error occurred.';

  res.status(statusCode).json({
    success: false,
    error: { code: errorCode, message },
  });
};
