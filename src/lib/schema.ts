import { pgTable, serial, text, timestamp, varchar, integer, jsonb, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    created_at: timestamp("created_at").defaultNow().notNull(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    password_hash: text("password_hash").notNull(), // Will store hashed password
    role: text("role").default("user").notNull(), // 'admin' | 'user'
    avatar_url: text("avatar_url"),
});

export const tickets = pgTable("tickets", {
    id: serial("id").primaryKey(),
    created_at: timestamp("created_at").defaultNow().notNull(),
    created_by: integer("created_by").references(() => users.id), // Link to User

    // Type: 'bug' or 'feature'
    type: text("type").notNull(),

    // Common Fields
    subject: text("subject").notNull(),
    description: text("description"), // Can be used for extra notes
    files: jsonb("files").$type<string[]>(), // Store file URLs/names

    // Bug Specific
    category: text("category"),
    module: text("module"),
    frequency: text("frequency"),
    scope: text("scope"),
    severity: integer("severity"),
    current_behavior: text("current_behavior"),
    expected_behavior: text("expected_behavior"),
    steps_to_reproduce: jsonb("steps_to_reproduce").$type<string[]>(),

    // Feature Specific
    problem_statement: text("problem_statement"),
    proposed_solution: text("proposed_solution"),
    business_value: text("business_value"),
    priority: integer("priority"),
    example_link: text("example_link"),

    // Status
    status: text("status").default("new").notNull(),
});

export const comments = pgTable("comments", {
    id: serial("id").primaryKey(),
    created_at: timestamp("created_at").defaultNow().notNull(),
    ticket_id: integer("ticket_id").references(() => tickets.id).notNull(),
    user_id: integer("user_id").references(() => users.id).notNull(),
    content: text("content").notNull(),
});
