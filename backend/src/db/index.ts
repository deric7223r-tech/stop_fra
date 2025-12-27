import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create PostgreSQL connection
const client = postgres(connectionString, {
  max: 20, // Maximum connections
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create Drizzle ORM instance
export const db = drizzle(client, { schema });

// Export schema for use in other files
export * from './schema';
