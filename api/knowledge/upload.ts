import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { jwtVerify } from 'jose';
import IncomingForm from 'formidable';
import fs from 'fs';
import pdf from 'pdf-parse';

export const config = {
    api: {
        bodyParser: false,
    },
};

// Local Schema
const documents = pgTable("documents", {
    id: serial("id").primaryKey(),
    filename: text("filename").notNull(),
    content: text("content").notNull(),
    status: text("status").default('indexing').notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
});

const SECRET_KEY = process.env.JWT_SECRET || 'dev_secret_key_change_me_in_prod';

export default async function handler(req: any, res: any) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
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

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const form = new IncomingForm();

        const [fields, files] = await new Promise<[any, any]>((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                resolve([fields, files]);
            });
        });

        const file = files.file?.[0] || files.file; // Formidable handling can vary by version
        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const buffer = fs.readFileSync(file.filepath);
        const data = await pdf(buffer);
        const extractedText = data.text;

        // DB Save
        if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
        const sql = neon(process.env.DATABASE_URL);
        const db = drizzle(sql, { schema: { documents } });

        await db.insert(documents).values({
            filename: file.originalFilename || 'unknown.pdf',
            content: extractedText,
            status: 'ready' // Since we parse immediately
        });

        return res.status(200).json({ success: true, filename: file.originalFilename });

    } catch (error: any) {
        console.error('Upload API Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
