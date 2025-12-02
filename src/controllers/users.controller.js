import logger from '#config/logger.js';
import {
  getAllUsers,
  getUserById as getUserByIdService,
  updateUser as updateUserService,
  deleteUser as deleteUserService,
} from '#services/users.services.js';
import {
  userIdSchema,
  updateUserSchema,
} from '#validations/users.validation.js';
import { formatValidationErrors } from '#utils/format.js';
import bcrypt from 'bcrypt';

export const fetchAllUsers = async (req, res, next) => {
  try {
    logger.info('Fetching all users');
    const allUsers = await getAllUsers();
    res.json({
      message: 'Users fetched successfully',
      users: allUsers,
      count: allUsers.length,
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    // Validate user ID
    const validationResult = userIdSchema.safeParse({ id: req.params.id });
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationErrors(validationResult.error),
      });
    }

    const { id } = validationResult.data;
    logger.info(`Fetching user with ID: ${id}`);

    const user = await getUserByIdService(id);

    res.json({
      message: 'User fetched successfully',
      user,
    });
  } catch (error) {
    logger.error(`Error fetching user: ${error.message}`);
    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    // Validate user ID
    const idValidation = userIdSchema.safeParse({ id: req.params.id });
    if (!idValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationErrors(idValidation.error),
      });
    }

    const { id } = idValidation.data;

    // Validate update data
    const bodyValidation = updateUserSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationErrors(bodyValidation.error),
      });
    }

    const updates = bodyValidation.data;

    // Authorization checks
    const authenticatedUserId = req.user?.id; // Assumes auth middleware sets req.user
    const authenticatedUserRole = req.user?.role;

    if (!authenticatedUserId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Users can only update their own information
    if (authenticatedUserId !== id && authenticatedUserRole !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only update your own information',
      });
    }

    // Only admins can change roles
    if (updates.role && authenticatedUserRole !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only administrators can change user roles',
      });
    }

    // Hash password if it's being updated
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    logger.info(`Updating user with ID: ${id}`);
    const updatedUser = await updateUserService(id, updates);

    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;

    res.json({
      message: 'User updated successfully',
      user: userWithoutPassword,
    });
  } catch (error) {
    logger.error(`Error updating user: ${error.message}`);
    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    // Validate user ID
    const validationResult = userIdSchema.safeParse({ id: req.params.id });
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationErrors(validationResult.error),
      });
    }

    const { id } = validationResult.data;

    // Authorization checks
    const authenticatedUserId = req.user?.id;
    const authenticatedUserRole = req.user?.role;

    if (!authenticatedUserId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Users can delete their own account, admins can delete any account
    if (authenticatedUserId !== id && authenticatedUserRole !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only delete your own account',
      });
    }

    logger.info(`Deleting user with ID: ${id}`);
    const result = await deleteUserService(id);

    res.json(result);
  } catch (error) {
    logger.error(`Error deleting user: ${error.message}`);
    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    next(error);
  }
};
