import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { eq, desc } from 'drizzle-orm';
import { jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

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

const SECRET_KEY = process.env.JWT_SECRET || 'dev_secret_key_change_me_in_prod';

export default async function handler(req: any, res: any) {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Verify Token for ALL requests to this endpoint
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing token' });
    }

    const token = authHeader.split(' ')[1];
    let userPayload;
    try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(SECRET_KEY));
        userPayload = payload;
    } catch (err) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    // RBAC: Only admins can list or create users
    if (userPayload.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admins only' });
    }

    try {
        // DB Connection (Lazy)
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL is not set');
        }
        const sql = neon(process.env.DATABASE_URL);
        const db = drizzle(sql, { schema: { users } });

        // GET: List all users
        if (req.method === 'GET') {
            const allUsers = await db.select({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
                created_at: users.created_at,
                avatar_url: users.avatar_url
            })
                .from(users)
                .orderBy(desc(users.created_at));

            return res.status(200).json(allUsers);
        }

        // POST: Create new user (Invite)
        if (req.method === 'POST') {
            const { name, email, password, role } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            // Check if user exists
            const existingUser = await db.select().from(users).where(eq(users.email, email));
            if (existingUser.length > 0) {
                return res.status(409).json({ error: 'User already exists' });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create user
            const newUser = await db.insert(users).values({
                name,
                email,
                password_hash: hashedPassword,
                role: role || 'user',
                avatar_url: `https://ui-avatars.com/api/?name=${name}&background=random`
            }).returning();

            return res.status(201).json(newUser[0]);
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error: any) {
        console.error('Users API Error:', error);
        return res.status(500).json({
            error: error.message || 'Internal server error',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
