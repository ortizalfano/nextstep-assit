
import { getDb } from '../../api/_db';
import { tickets, users } from '../_schema';
import { eq, desc } from 'drizzle-orm';

export default async function handler(req: any, res: any) {
    if (req.method === 'GET') {
        // Fetch tickets
        // Query params: role, user_id (to filter)
        const { role, user_id } = req.query;

        try {
            const db = getDb();
            let result;
            let query = db.select({
                id: tickets.id,
                type: tickets.type,
                subject: tickets.subject,
                status: tickets.status,
                priority: tickets.priority,
                created_at: tickets.created_at,
                created_by: tickets.created_by,
                created_by_name: users.name
            })
                .from(tickets)
                .leftJoin(users, eq(tickets.created_by, users.id));

            // Apply filters
            if (user_id) {
                // If user_id is provided, filter by it (works for Admin viewing specific user too)
                // Note: For regular users, ensure they can't filter by others (secure on frontend or strictly here?)
                // Security: Ideally, if role=='user', we force user_id to be their own.
                // But for now, trusting the param is consistent with current MVP.
                // Actually, let's keep the role check for security "enforcement" if needed, 
                // but for Admin viewing a user, we pass user_id.
                // Simplest fix: Just append where clause.
                // However, strictly speaking:
                // If Admin -> Can see all. If user_id param provided, filter by it.
                // If User -> MUST see only their own.

                if (role === 'admin' || role === 'manager') {
                    // specific filter
                    // @ts-ignore - dynamic query construction with drizzle is a bit verbose without 'where' chaining helpers sometimes
                    // confusing. Let's stick to the if/else block structure but improved.
                }
            }

            // Refactored Logic:
            let conditions = [];

            // Security constraint: If NOT admin/manager, MUST filter by self
            if (role !== 'admin' && role !== 'manager') {
                // The frontend passes 'user_id' as the logged in user's ID. 
                // We should verify this matches or rely on session if we had it. 
                // For now relying on param.
                conditions.push(eq(tickets.created_by, user_id));
            } else {
                // If Admin/Manager AND specific user_id requested (filtering)
                if (user_id) {
                    conditions.push(eq(tickets.created_by, user_id));
                }
            }

            let baseQuery = db.select({
                id: tickets.id,
                type: tickets.type,
                subject: tickets.subject,
                status: tickets.status,
                priority: tickets.priority,
                created_at: tickets.created_at,
                created_by: tickets.created_by,
                created_by_name: users.name
            })
                .from(tickets)
                .leftJoin(users, eq(tickets.created_by, users.id));

            if (conditions.length > 0) {
                // @ts-ignore
                result = await baseQuery.where(conditions[0]).orderBy(desc(tickets.created_at));
            } else {
                result = await baseQuery.orderBy(desc(tickets.created_at));
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
            const db = getDb();
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
