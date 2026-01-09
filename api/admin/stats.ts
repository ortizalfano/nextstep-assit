
import { db } from '../../src/lib/db';
import { tickets, users } from '../../src/lib/schema';
import { eq, sql } from 'drizzle-orm';

export default async function handler(req: any, res: any) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // 1. KPI Counts
        // We can run multiple queries or one complex one. Drizzle async allows parallel.

        // Total Tickets
        const totalTicketsQuery = db.select({ count: sql<number>`count(*)` }).from(tickets);
        // Open (New + In Progress)
        const activeTicketsQuery = db.select({ count: sql<number>`count(*)` }).from(tickets).where(sql`${tickets.status} IN ('new', 'in_progress')`);
        // Resolved
        const resolvedTicketsQuery = db.select({ count: sql<number>`count(*)` }).from(tickets).where(eq(tickets.status, 'resolved'));
        // Critical
        const criticalTicketsQuery = db.select({ count: sql<number>`count(*)` }).from(tickets).where(eq(tickets.priority, 'critical'));

        const [total, active, resolved, critical] = await Promise.all([
            totalTicketsQuery, activeTicketsQuery, resolvedTicketsQuery, criticalTicketsQuery
        ]);

        // 2. Top Reporters (Mock logic or Group By)
        // Simplification for MVP: Fetch counts grouped by created_by
        const reporters = await db.select({
            userId: tickets.created_by,
            count: sql<number>`count(*)`
        }).from(tickets).groupBy(tickets.created_by).orderBy(sql`count(*) desc`).limit(3);

        // Fetch user names for these IDs
        const reporterDetails = await Promise.all(reporters.map(async (r) => {
            if (!r.userId) return { name: 'Unknown', count: r.count };
            const u = await db.select().from(users).where(eq(users.id, r.userId));
            return {
                name: u[0]?.name || 'Unknown',
                email: u[0]?.email,
                count: Number(r.count), // Ensure number
                avatar: `https://ui-avatars.com/api/?name=${u[0]?.name}&background=random`
            };
        }));

        // 3. Urgency Breakdown (Mock or Group By)
        const priorityCounts = await db.select({
            priority: tickets.priority,
            count: sql<number>`count(*)`
        }).from(tickets).groupBy(tickets.priority);

        // Formatting for chart
        const urgencyData = [
            { name: 'Low', value: Number(priorityCounts.find(p => p.priority === 'low')?.count || 0), color: '#4ade80' },
            { name: 'Medium', value: Number(priorityCounts.find(p => p.priority === 'medium')?.count || 0), color: '#fbbf24' },
            { name: 'High', value: Number(priorityCounts.find(p => p.priority === 'high')?.count || 0), color: '#f87171' },
            { name: 'Critical', value: Number(priorityCounts.find(p => p.priority === 'critical')?.count || 0), color: '#ef4444' }
        ];

        return res.status(200).json({
            kpi: {
                totalTickets: Number(total[0].count),
                activeTickets: Number(active[0].count),
                resolvedTickets: Number(resolved[0].count),
                criticalTickets: Number(critical[0].count),
            },
            topReporters: reporterDetails,
            urgencyData
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
}
