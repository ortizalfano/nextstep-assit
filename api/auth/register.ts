
import { getDb } from '../_db';
import { users } from '../_schema';
import { eq } from 'drizzle-orm';

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, email, password } = req.body;

    if (!email || !password || !name) {
        return res.status(400).json({ error: 'Missing fields' });
    }

    try {
        const db = getDb();

        // Check if user exists
        const existingUser = await db.select().from(users).where(eq(users.email, email));
        if (existingUser.length > 0) {
            return res.status(409).json({ error: 'User already exists' });
        }

        // Create user
        const newUser = await db.insert(users).values({
            name,
            email,
            password_hash: password,
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
        console.error('API Error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
