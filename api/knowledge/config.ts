import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, text } from 'drizzle-orm/pg-core';
import { eq } from 'drizzle-orm';
import { jwtVerify } from 'jose';

// Local Schema Definition
const app_config = pgTable("app_config", {
    key: text("key").primaryKey(),
    value: text("value").notNull(),
});

const SECRET_KEY = process.env.JWT_SECRET || 'dev_secret_key_change_me_in_prod';

export default async function handler(req: any, res: any) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // Auhtentication (Admins Only)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(SECRET_KEY));
        if (payload.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    } catch {
        return res.status(401).json({ error: 'Invalid Token' });
    }

    try {
        if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
        const sql = neon(process.env.DATABASE_URL);
        const db = drizzle(sql, { schema: { app_config } });

        if (req.method === 'GET') {
            const result = await db.select().from(app_config).where(eq(app_config.key, 'gemini_api_key'));
            // Return masked key if exists
            if (result.length > 0) {
                const key = result[0].value;
                const masked = key.substring(0, 4) + '...' + key.substring(key.length - 4);
                return res.status(200).json({ isConfigured: true, maskedKey: masked });
            }
            return res.status(200).json({ isConfigured: false });
        }

        if (req.method === 'POST') {
            const { apiKey } = req.body;
            if (!apiKey) return res.status(400).json({ error: 'API Key required' });

            // Upsert
            const existing = await db.select().from(app_config).where(eq(app_config.key, 'gemini_api_key'));
            if (existing.length > 0) {
                await db.update(app_config).set({ value: apiKey }).where(eq(app_config.key, 'gemini_api_key'));
            } else {
                await db.insert(app_config).values({ key: 'gemini_api_key', value: apiKey });
            }
            return res.status(200).json({ success: true });
        }

    } catch (error: any) {
        console.error('Config API Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
