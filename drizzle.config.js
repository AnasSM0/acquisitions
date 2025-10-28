import 'dotenv/config';
export default {
  schema: './src/models/*.js',
  out: './drizzle',
  dialect: 'postgresql',
  // drizzle-kit expects a `dbCredentials` property (not `dbCreds`).
  // Provide the connection URL via env var DATABASE_URL.
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
};
