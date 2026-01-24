import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { eq } from 'drizzle-orm';
import { jwtVerify } from 'jose';
import * as cheerio from 'cheerio';

// Schema Definition (Should match api/_schema.ts)
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
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    // Authentication (Admin Only)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(SECRET_KEY));
        if (payload.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    } catch (e: any) {
        return res.status(401).json({ error: 'Invalid Token', details: e.message });
    }

    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    try {
        // Scrape content using fetch + cheerio
        console.log(`Scraping URL: ${url}`);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch URL: ${response.statusText}`);

        const html = await response.text();
        const $ = cheerio.load(html);

        // Extract text (remove scripts, styles, etc.)
        $('script').remove();
        $('style').remove();
        $('nav').remove();
        $('footer').remove();

        // Improve extraction by targeting main content if possible, or body fallback
        const mainContent = $('main').length ? $('main').text() : $('body').text();
        // Clean up whitespace
        const cleanContent = mainContent.replace(/\s\s+/g, ' ').trim();
        const title = $('title').text() || url;

        if (!cleanContent) {
            throw new Error("No readable text found on page");
        }

        // Save to DB
        if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
        const sql = neon(process.env.DATABASE_URL);
        const db = drizzle(sql, { schema: { documents } });

        await db.insert(documents).values({
            filename: title.substring(0, 255), // Use title as filename
            content: cleanContent,
            status: 'ready',
            type: 'url',
            url: url
        });

        return res.status(200).json({ success: true, title });

    } catch (error: any) {
        console.error('Scrape Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
