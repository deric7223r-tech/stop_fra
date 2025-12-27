/**
 * Database Connection
 * PostgreSQL connection using the postgres library
 */

import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

// Get database URL from environment
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create postgres connection
export const sql = postgres(DATABASE_URL, {
  max: 10, // Maximum number of connections
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create drizzle instance with schema
export const db = drizzle(sql, { schema });

// Test connection
export async function testConnection(): Promise<boolean> {
  try {
    await sql`SELECT 1`;
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function closeConnection(): Promise<void> {
  await sql.end();
  console.log('Database connection closed');
}

export default db;
