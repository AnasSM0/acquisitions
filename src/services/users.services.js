import { db } from '#config/database.js';
import logger from '#config/logger.js';
import { users } from '#models/user.model.js';

export const getAllUsers = async () => {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users);
    return allUsers;
  } catch (error) {
    logger.error(`Error fetching users: ${error}`);
    throw new Error('Error fetching users');
  }
};
