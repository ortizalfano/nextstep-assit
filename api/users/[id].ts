import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { eq } from 'drizzle-orm';

// Define Schema Locally
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
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        // DB Connection (Lazy)
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL is not set');
        }
        const sql = neon(process.env.DATABASE_URL);
        const db = drizzle(sql, { schema: { users } });

        // PUT: Update user (e.g., Role)
        if (req.method === 'PUT') {
            const { role, name, email } = req.body;

            // Construct update object dynamically
            const updates: any = {};
            if (role) updates.role = role;
            if (name) updates.name = name;
            if (email) updates.email = email;

            if (Object.keys(updates).length === 0) {
                return res.status(400).json({ error: 'No fields to update' });
            }

            const updatedUser = await db.update(users)
                .set(updates)
                .where(eq(users.id, Number(id)))
                .returning();

            if (updatedUser.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            return res.status(200).json(updatedUser[0]);
        }

        // DELETE: Remove user
        if (req.method === 'DELETE') {
            const deletedUser = await db.delete(users)
                .where(eq(users.id, Number(id)))
                .returning();

            if (deletedUser.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            return res.status(200).json({ message: 'User deleted successfully' });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error: any) {
        console.error('User Detail API Error:', error);
        return res.status(500).json({
            error: error.message || 'Internal server error',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
