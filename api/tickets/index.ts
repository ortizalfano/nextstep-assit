import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, serial, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';
import { eq, desc } from 'drizzle-orm';

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
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // DB Connection (Lazy)
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL is not set');
        }
        const sql = neon(process.env.DATABASE_URL);
        const db = drizzle(sql, { schema: { users, tickets } });

        if (req.method === 'GET') {
            const { role, user_id } = req.query;
            let conditions = [];

            if (role !== 'admin' && role !== 'manager') {
                conditions.push(eq(tickets.created_by, user_id));
            } else {
                if (user_id) {
                    conditions.push(eq(tickets.created_by, user_id));
                }
            }

            let baseQuery = db.select({
                id: tickets.id,
                type: tickets.type,
                subject: tickets.subject,
                description: tickets.description,
                files: tickets.files,
                category: tickets.category,
                module: tickets.module,
                frequency: tickets.frequency,
                scope: tickets.scope,
                severity: tickets.severity,
                current_behavior: tickets.current_behavior,
                expected_behavior: tickets.expected_behavior,
                steps_to_reproduce: tickets.steps_to_reproduce,
                problem_statement: tickets.problem_statement,
                proposed_solution: tickets.proposed_solution,
                business_value: tickets.business_value,
                example_link: tickets.example_link,
                status: tickets.status,
                priority: tickets.priority,
                created_at: tickets.created_at,
                created_by: tickets.created_by,
                created_by_name: users.name
            })
                .from(tickets)
                .leftJoin(users, eq(tickets.created_by, users.id));

            let result;
            if (conditions.length > 0) {
                // @ts-ignore
                result = await baseQuery.where(conditions[0]).orderBy(desc(tickets.created_at));
            } else {
                result = await baseQuery.orderBy(desc(tickets.created_at));
            }

            return res.status(200).json(result);
        }

        if (req.method === 'POST') {
            const { type, priority, subject, description, steps_to_reproduce, files, created_by, status,
                category, module, frequency, scope, severity, current_behavior, expected_behavior,
                problem_statement, proposed_solution, business_value, example_link
            } = req.body;

            const newTicket = await db.insert(tickets).values({
                type,
                priority,
                subject,
                description,
                steps_to_reproduce,
                files,
                created_by,
                status: status || 'new',
                // Optional fields
                category, module, frequency, scope, severity, current_behavior, expected_behavior,
                problem_statement, proposed_solution, business_value, example_link
            }).returning();

            return res.status(201).json(newTicket[0]);
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error: any) {
        console.error('Tickets API Error:', error);
        return res.status(500).json({
            error: error.message || 'Internal server error',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
