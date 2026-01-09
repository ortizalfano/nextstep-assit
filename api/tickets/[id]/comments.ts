
import { db } from '../../../src/lib/db';
import { comments, users } from '../../../src/lib/schema';
import { eq, asc } from 'drizzle-orm';

export default async function handler(req: any, res: any) {
    const { id } = req.query; // Ticket ID

    if (req.method === 'GET') {
        // Fetch comments for ticket + author info
        try {
            const result = await db.select({
                id: comments.id,
                content: comments.content,
                created_at: comments.created_at,
                user_id: comments.user_id,
                user_name: users.name,
                user_role: users.role,
            })
                .from(comments)
                .leftJoin(users, eq(comments.user_id, users.id))
                .where(eq(comments.ticket_id, id))
                .orderBy(asc(comments.created_at));

            return res.status(200).json(result);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to fetch comments' });
        }
    }

    if (req.method === 'POST') {
        const { content, user_id } = req.body;
        try {
            const newComment = await db.insert(comments).values({
                ticket_id: id,
                user_id,
                content,
            }).returning();

            return res.status(201).json(newComment[0]);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to post comment' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
