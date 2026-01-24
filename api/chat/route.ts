
// Note: This requires @google/generative-ai package
import { GoogleGenerativeAI } from '@google/generative-ai';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, text, serial, timestamp } from 'drizzle-orm/pg-core';
import { eq } from 'drizzle-orm';

// Local Schema needed for RAG
const app_config = pgTable("app_config", {
    key: text("key").primaryKey(),
    value: text("value").notNull(),
});

const documents = pgTable("documents", {
    id: serial("id").primaryKey(),
    filename: text("filename").notNull(),
    content: text("content").notNull(),
    status: text("status").default('indexing').notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
});

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message, history } = req.body;

    try {
        // 1. Fetch Configuration (API Key & Context)
        if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
        const sql = neon(process.env.DATABASE_URL);
        const db = drizzle(sql, { schema: { app_config, documents } });

        // Get API Key
        let apiKey = process.env.GEMINI_API_KEY;
        const keyConfig = await db.select().from(app_config).where(eq(app_config.key, 'gemini_api_key'));
        if (keyConfig.length > 0) {
            apiKey = keyConfig[0].value;
        }

        if (!apiKey) {
            return res.status(500).json({ error: 'Gemini API Key not configured' });
        }

        // 2. Get RAG Context (Simple retrieval: Get all 'ready' docs)
        // Optimization: In production, use Vector Search. Here we concat all text (Small Knowledge Base)
        const docs = await db.select().from(documents).where(eq(documents.status, 'ready'));
        let context = "";
        if (docs.length > 0) {
            context = "Use the following knowledge base to answer the user's question. If the answer is not in the context, say so.\n\n";
            docs.forEach(doc => {
                context += `--- Source: ${doc.filename} ---\n${doc.content}\n\n`;
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // 3. Construct System Prompt
        // Gemini API doesn't have explicit "system" role in history mostly, we usually prepend it to the first message or use systemInstruction depending on version.
        // We will prepend context to the current message for simplicity.
        const fullMessage = context ? `${context}\n\nUser Question: ${message}` : message;

        const chat = model.startChat({
            history: history || [],
            generationConfig: {
                maxOutputTokens: 800, // Increased for detailed answers
            },
        });

        const result = await chat.sendMessage(fullMessage);
        const response = await result.response;
        const text = response.text();

        return res.status(200).json({ text });
    } catch (error: any) {
        console.error('Chat API Error:', error);
        return res.status(500).json({ error: 'Failed to generate response: ' + error.message });
    }
}
