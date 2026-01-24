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

    const { url, crawl } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    // Configuration
    const MAX_PAGES = crawl ? 10 : 1;
    const visited = new Set<string>();
    const queue = [url];
    // Helper to get domain safely
    let domain = '';
    try {
        domain = new URL(url).hostname;
    } catch {
        return res.status(400).json({ error: 'Invalid URL' });
    }

    console.log(`Starting scrape for ${url} (Crawl: ${crawl}, Max: ${MAX_PAGES})`);

    // Tools setup
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql, { schema: { documents } });

    let pagesProcessed = 0;
    const results = [];

    try {
        while (queue.length > 0 && pagesProcessed < MAX_PAGES) {
            const currentUrl = queue.shift();
            if (!currentUrl || visited.has(currentUrl)) continue;

            visited.add(currentUrl);
            console.log(`Processing: ${currentUrl}`);

            try {
                const response = await fetch(currentUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
                    }
                });

                if (!response.ok) {
                    console.warn(`Failed to fetch ${currentUrl}: ${response.status}`);
                    continue;
                }

                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('text/html')) {
                    continue;
                }

                const html = await response.text();
                const $ = cheerio.load(html);

                // 1. Better Extraction Logic
                // Remove noise
                $('script, style, nav, footer, iframe, noscript, .ad, .cookie-banner, .menu, .sidebar').remove();

                // Try to find main content container
                // Added legacy selectors: .contentbox, .contents, #pagecontenthelp
                const contentSelectors = ['main', 'article', '#content', '.content', '.documentation', '.markdown-body', '.contentbox', '.contents', '#pagecontenthelp'];
                let mainText = '';

                for (const selector of contentSelectors) {
                    const el = $(selector);
                    if (el.length) {
                        mainText = el.text();
                        if (mainText.length > 500) break; // Found a good chunk
                    }
                }

                // Fallback to body if no main container found or text is too short
                if (mainText.length < 200) {
                    mainText = $('body').text();
                }

                const cleanContent = mainText.replace(/\s+/g, ' ').trim();
                const title = $('title').text().trim() || currentUrl;

                if (cleanContent.length > 50) { // Only save if substantial content
                    results.push({
                        filename: `${title} [${currentUrl}]`,
                        content: `URL: ${currentUrl}\nTITLE: ${title}\n\n${cleanContent}`,
                        status: 'ready',
                        type: 'url',
                        url: currentUrl
                    });
                    pagesProcessed++;
                }

                // 2. Discover Links (BFS)
                if (crawl) {
                    $('a[href]').each((_, el) => {
                        const href = $(el).attr('href');
                        if (href) {
                            try {
                                const absoluteUrl = new URL(href, currentUrl).href;
                                const linkUrlObj = new URL(absoluteUrl);

                                // Only follow internal links
                                if (linkUrlObj.hostname === domain && !visited.has(absoluteUrl)) {
                                    // Avoid common generated junk and query params if possible
                                    // Simplifying for stability
                                    if (!absoluteUrl.match(/\.(png|jpg|jpeg|gif|pdf|zip|css|js)$/i)) {
                                        queue.push(absoluteUrl);
                                    }
                                }
                            } catch (e) {
                                // Ignore invalid URLs
                            }
                        }
                    });
                }

            } catch (err) {
                console.error(`Error scraping ${currentUrl}:`, err);
            }
        }

        if (results.length === 0) {
            throw new Error("No readable text found on page(s)");
        }

        // Batch insert
        // Note: Drizzle's neondatabase driver might not support simple batch insert with existing connections in some versions,
        // but sequential insert is fine for <10 items.
        for (const doc of results) {
            // Basic conflict check could be added here, but duplicates allowed for now updates
            await db.insert(documents).values(doc);
        }

        return res.status(200).json({ success: true, count: results.length, pages: results.map(r => r.filename) });

    } catch (error: any) {
        console.error('Scrape Critical Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
