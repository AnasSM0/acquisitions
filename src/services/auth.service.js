import logger from '#config/logger.js';
import bcrypt from 'bcrypt';
import { db } from '#config/database.js';
import { users } from '#models/user.model.js';
import { eq } from 'drizzle-orm';

export const hashPassword = async password => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    logger.error(`Error hashing password: ${error}`);
    throw new Error('Error hashing');
  }
};

export const createUser = async ({
  username,
  email,
  password,
  role = 'user',
}) => {
  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existingUser.length > 0) {
      throw new Error('User with this email already exists');
    }
    const hashedPassword = await hashPassword(password);
    const [newUser] = await db
      .insert(users)
      .values({
        username,
        email,
        password: hashedPassword,
        role,
      })
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      });
    logger.info(`User created with ID: ${newUser.id}`);
    return newUser;
  } catch (error) {
    logger.error(`Error creating user: ${error}`);
    throw new Error('Error creating user');
  }
};
