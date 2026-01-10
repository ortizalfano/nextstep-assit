
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './_schema';

export function getDb() {
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is not defined in environment variables');
    }
    const sql = neon(process.env.DATABASE_URL);
    return drizzle(sql, { schema });
}
