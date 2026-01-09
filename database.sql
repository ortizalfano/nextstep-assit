-- Run this query in your Neon SQL Editor to create the tables

-- 1. Users Table (Authentication)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user', -- 'admin', 'support', 'user'
    avatar_url TEXT
);

-- 2. Tickets Table (Support Wizard)
CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by INTEGER REFERENCES users(id), -- Link to User
    
    -- Type: 'bug' or 'feature'
    type TEXT NOT NULL,
    
    -- Common Fields
    subject TEXT NOT NULL,
    description TEXT,
    files JSONB, -- Stores array of file URLs/names
    
    -- Bug Specific
    category TEXT,
    module TEXT,
    frequency TEXT,
    scope TEXT,
    severity INTEGER,
    current_behavior TEXT,
    expected_behavior TEXT,
    steps_to_reproduce JSONB, -- Stores array of strings
    
    -- Feature Specific
    problem_statement TEXT,
    proposed_solution TEXT,
    business_value TEXT,
    priority INTEGER,
    example_link TEXT,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'new'
);

-- 3. Comments Table (Ticket Activity)
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    ticket_id INTEGER NOT NULL REFERENCES tickets(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    content TEXT NOT NULL
);
