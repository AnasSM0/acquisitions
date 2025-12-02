import { formatValidationErrors } from '#utils/format.js';
import logger from '#utils/logger.js';
import { cookies } from '#utils/cookies.js';
import { jwtToken } from '#utils/jwt.js';
import { signupSchema } from '../validations/auth.validation.js';
import { createUser } from '#services/auth.service.js';

export const signup = async (req, res, next) => {
  try {
    console.log('req.body:', req.body);
    console.log('typeof req.body:', typeof req.body);
    const validationResult = signupSchema.safeParse(req.body);
    console.log('validationResult:', validationResult);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationErrors(validationResult.error),
      });
    }
    const { username, email, role } = validationResult.data;

    const user = await createUser({
      username,
      email,
      password: validationResult.data.password,
      role,
    });

    const token = jwtToken.sign({ userId: user.id, role: user.role });
    cookies.set(res, 'token', token);

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
