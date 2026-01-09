
import { db } from '../../src/lib/db';
import { tickets } from '../../src/lib/schema';
import { eq, desc } from 'drizzle-orm';

export default async function handler(req: any, res: any) {
    if (req.method === 'GET') {
        // Fetch tickets
        // Query params: role, user_id (to filter)
        const { role, user_id } = req.query;

        try {
            let result;
            if (role === 'admin' || role === 'manager') {
                // Fetch all tickets
                result = await db.select().from(tickets).orderBy(desc(tickets.created_at));
            } else if (user_id) {
                // Fetch user specific tickets
                result = await db.select().from(tickets).where(eq(tickets.created_by, user_id)).orderBy(desc(tickets.created_at));
            } else {
                result = [];
            }

            return res.status(200).json(result);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to fetch tickets' });
        }
    }

    if (req.method === 'POST') {
        // Create new ticket
        const { type, priority, subject, description, steps_to_reproduce, files, created_by, status } = req.body;

        try {
            const newTicket = await db.insert(tickets).values({
                type,
                priority,
                subject,
                description,
                steps_to_reproduce, // JSONB
                files, // JSONB
                created_by,
                status: status || 'new'
            }).returning();

            return res.status(201).json(newTicket[0]);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to create ticket' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
