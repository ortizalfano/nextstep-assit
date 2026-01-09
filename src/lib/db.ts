import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// This is designed to run in a serverless environment (Edge compatible)
const sql = neon(import.meta.env.VITE_DATABASE_URL || process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
