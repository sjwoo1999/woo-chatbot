import type { Config } from 'drizzle-kit';

export default {
  schema: './src/schema.ts',
  out: './migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DB_URL || 'postgres://postgres:postgres@localhost:5432/woo',
  },
} satisfies Config;
