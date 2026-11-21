const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const sql = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number TEXT UNIQUE NOT NULL,
    student_name TEXT NOT NULL,
    student_id TEXT NOT NULL,
    student_email TEXT,
    student_phone TEXT,
    raw_text TEXT NOT NULL,
    detected_language TEXT NOT NULL DEFAULT 'English',
    category TEXT NOT NULL,
    urgency TEXT NOT NULL DEFAULT 'Medium',
    block TEXT DEFAULT 'Campus General',
    floor TEXT DEFAULT 'Unspecified',
    room TEXT DEFAULT 'General Area',
    problem_details TEXT NOT NULL,
    confidence_score NUMERIC(5,2) NOT NULL DEFAULT 85.0,
    routing_status TEXT NOT NULL DEFAULT 'AUTO_ROUTED',
    assigned_department TEXT NOT NULL,
    assigned_technician TEXT,
    status TEXT NOT NULL DEFAULT 'Pending',
    resolution_notes TEXT,
    processing_latency_ms INTEGER DEFAULT 320,
    api_cost_usd NUMERIC(8,6) DEFAULT 0.000125,
    tokens_used INTEGER DEFAULT 450,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS ticket_timeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    actor TEXT NOT NULL,
    details TEXT NOT NULL,
    badge_type TEXT DEFAULT 'system',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    student_id_or_employee_id TEXT,
    department TEXT,
    role TEXT NOT NULL DEFAULT 'Student',
    requested_role TEXT NOT NULL DEFAULT 'Student',
    status TEXT NOT NULL DEFAULT 'APPROVED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public select complaints" ON complaints;
CREATE POLICY "Public select complaints" ON complaints FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert complaints" ON complaints;
CREATE POLICY "Public insert complaints" ON complaints FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update complaints" ON complaints;
CREATE POLICY "Public update complaints" ON complaints FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public delete complaints" ON complaints;
CREATE POLICY "Public delete complaints" ON complaints FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public select timeline" ON ticket_timeline;
CREATE POLICY "Public select timeline" ON ticket_timeline FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert timeline" ON ticket_timeline;
CREATE POLICY "Public insert timeline" ON ticket_timeline FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public select profiles" ON profiles;
CREATE POLICY "Public select profiles" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert profiles" ON profiles;
CREATE POLICY "Public insert profiles" ON profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update profiles" ON profiles;
CREATE POLICY "Public update profiles" ON profiles FOR UPDATE USING (true);
`;

async function run() {
  const client = new Client({
    host: 'aws-0-ap-northeast-1.pooler.supabase.com',
    port: 6543,
    user: 'postgres.qejxlvizrfbzjajbjqtx',
    password: '@Ryomen0PYT',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to Supabase PostgreSQL at aws-0-ap-northeast-1.pooler.supabase.com:6543 ...');
    await client.connect();
    console.log('Connected! Executing schema migration...');
    await client.query(sql);
    console.log('SUCCESS: Schema migration executed cleanly! All tables created.');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await client.end();
  }
}

run();
