import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { eq } from 'drizzle-orm';

// Define Schema Locally to avoid import resolution issues in Serverless limits
const users = pgTable("users", {
    id: serial("id").primaryKey(),
    created_at: timestamp("created_at").defaultNow().notNull(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    password_hash: text("password_hash").notNull(),
    role: text("role").default("user").notNull(),
    avatar_url: text("avatar_url"),
});

export default async function handler(req: any, res: any) {
    // CORS Headers just in case (though usually handled by Vercel for same origin)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { name, email, password } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Missing fields' });
        }

        // DB Connection (Lazy)
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL is not set');
        }
        const sql = neon(process.env.DATABASE_URL);
        const db = drizzle(sql, { schema: { users } });

        // Check if user exists
        const existingUser = await db.select().from(users).where(eq(users.email, email));
        if (existingUser.length > 0) {
            return res.status(409).json({ error: 'User already exists' });
        }

        // Create user
        const newUser = await db.insert(users).values({
            name,
            email,
            password_hash: password, // In a real app, hash this password!
            role: 'user',
            avatar_url: `https://ui-avatars.com/api/?name=${name}&background=random`
        }).returning();

        return res.status(201).json({
            user: {
                id: newUser[0].id,
                name: newUser[0].name,
                email: newUser[0].email,
                role: newUser[0].role,
                avatar_url: newUser[0].avatar_url
            }
        });

    } catch (error: any) {
        console.error('Register API Error:', error);
        return res.status(500).json({
            error: error.message || 'Internal server error',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
