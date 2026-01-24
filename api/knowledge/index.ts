import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { eq, desc } from 'drizzle-orm';
import { jwtVerify } from 'jose';

// Local Schema
const documents = pgTable("documents", {
    id: serial("id").primaryKey(),
    filename: text("filename").notNull(),
    content: text("content").notNull(),
    status: text("status").default('indexing').notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
    type: text("type").default('pdf').notNull(),
    url: text("url"),
});

const SECRET_KEY = process.env.JWT_SECRET || 'dev_secret_key_change_me_in_prod';

export default async function handler(req: any, res: any) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // Auth
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
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
        const db = drizzle(sql, { schema: { documents } });

        if (req.method === 'GET') {
            id: documents.id,
                filename: documents.filename,
                    status: documents.status,
                        created_at: documents.created_at,
                            type: documents.type,
                                url: documents.url,
            }).from(documents).orderBy(desc(documents.created_at));
        return res.status(200).json(docs);
    }

        if (req.method === 'DELETE') {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'ID required' });
        await db.delete(documents).where(eq(documents.id, Number(id)));
        return res.status(200).json({ success: true });
    }

} catch (error: any) {
    console.error('Knowledge API Error:', error);
    return res.status(500).json({ error: error.message });
}
}
