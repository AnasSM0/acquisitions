import {pgTable,serial,timestamp,varchar} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name',{length:255}).NotNull(),
  email: varchar('email',{length:255}).NotNull().unique(),
  password: varchar('password',{length:255}).NotNull(),
  role: varchar('role',{length:50}).NotNull().default('user'),
  createdAt: timestamp('created_at').defaultNow().NotNull(),
  updatedAt: timestamp('updated_at').defaultNow().NotNull(),
});