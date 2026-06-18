/** Role hierarchy: higher number = more permissions */
const ROLE_HIERARCHY = { user: 1, manager: 2, admin: 3 };

/**
 * authorize(...roles) — Allow access if req.user has AT LEAST one of the given roles.
 * Must come after the `protect` middleware.
 *
 * Usage: router.delete('/:id', protect, authorize('admin'), deleteLead)
 */
export const authorize = (...roles) => (req, res, next) => {
  const userLevel = ROLE_HIERARCHY[req.user?.role] ?? 0;
  const requiredLevel = Math.min(...roles.map((r) => ROLE_HIERARCHY[r] ?? 99));

  if (userLevel < requiredLevel) {
    return res.status(403).json({
      success: false,
      error: {
        code:    'FORBIDDEN',
        message: `Access denied. Required role: ${roles.join(' or ')}`,
      },
    });
  }
  next();
};
