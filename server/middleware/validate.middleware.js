/**
 * validate(schema) — Zod request body validation middleware factory.
 * Throws a ZodError on failure, which is caught by errorHandler.
 *
 * Usage: router.post('/register', validate(registerSchema), register)
 */
export const validate = (schema) => (req, _res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    next(err); // forwarded to errorHandler (ZodError branch)
  }
};
