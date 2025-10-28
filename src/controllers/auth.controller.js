import { formatValidationErrors } from '#utils/format.js';
import logger from '#utils/logger.js';
import { signupSchema } from '#validations/auth.validation.js';

export const signup = async (req, res, next) => {
  try {
    const validationResult = signupSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationErrors(validationResult.error),
      });
    }
    const { username, email, role } = validationResult.data;
    logger.info(`Signing up user: ${email}`);
    res.status(201).json({
      message: 'User signed up successfully',
      user: {
        id: 1,
        username,
        email,
        role,
      },
    });
  } catch (error) {
    logger.error('Signup Error:', error);
    if (error.message === 'User with this email already exists') {
      return res.status(409).json({ error_mes: 'User already exists' });
    }
    next(error);
  }
};
