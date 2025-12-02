import logger from '#config/logger.js';
import { getAllUsers } from '#services/users.service.js'; // Fixed: removed extra 's'

export const fetchAllUsers = async (req, res, next) => { // Fixed: added parameters
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