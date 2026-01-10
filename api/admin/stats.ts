import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, serial, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';
import { eq, sql, desc } from 'drizzle-orm';

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

const tickets = pgTable("tickets", {
    id: serial("id").primaryKey(),
    created_at: timestamp("created_at").defaultNow().notNull(),
    created_by: integer("created_by").references(() => users.id),
    type: text("type").notNull(),
    subject: text("subject").notNull(),
    description: text("description"),
    files: jsonb("files").$type<string[]>(),
    category: text("category"),
    module: text("module"),
    frequency: text("frequency"),
    scope: text("scope"),
    severity: text("severity"),
    current_behavior: text("current_behavior"),
    expected_behavior: text("expected_behavior"),
    steps_to_reproduce: jsonb("steps_to_reproduce").$type<string[]>(),
    problem_statement: text("problem_statement"),
    proposed_solution: text("proposed_solution"),
    business_value: text("business_value"),
    priority: text("priority"),
    example_link: text("example_link"),
    status: text("status").default("new").notNull(),
});

export default async function handler(req: any, res: any) {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL is not set');
        }
        const sqlClient = neon(process.env.DATABASE_URL);
        const db = drizzle(sqlClient, { schema: { users, tickets } });

        // 1. KPI Counts
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

        // 2. Top Reporters
        const reporters = await db.select({
            userId: tickets.created_by,
            count: sql<number>`count(*)`
        }).from(tickets).groupBy(tickets.created_by).orderBy(sql`count(*) desc`).limit(5);

        // Fetch user names for these IDs
        const reporterDetails = await Promise.all(reporters.map(async (r) => {
            if (!r.userId) return { name: 'Unknown', count: Number(r.count), avatar: '' };
            const u = await db.select().from(users).where(eq(users.id, r.userId));
            const userName = u[0]?.name || 'Unknown';
            return {
                name: userName,
                email: u[0]?.email,
                count: Number(r.count),
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`
            };
        }));

        // 3. Urgency Breakdown
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

    } catch (error: any) {
        console.error('Admin Stats API Error:', error);
        return res.status(500).json({ error: 'Failed to fetch admin stats: ' + error.message });
    }
}
