-- ====================================================================
-- CampusCare AI: Database Schema & Migration for Supabase
-- Run this in your Supabase SQL Editor (https://app.supabase.com)
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Complaints Table
CREATE TABLE IF NOT EXISTS complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number TEXT UNIQUE NOT NULL,
    student_name TEXT NOT NULL,
    student_id TEXT NOT NULL,
    student_email TEXT,
    student_phone TEXT,
    raw_text TEXT NOT NULL,
    detected_language TEXT NOT NULL DEFAULT 'English', -- 'English', 'Hinglish', 'Punjabi'
    category TEXT NOT NULL, -- 'Plumbing', 'Electrical', 'Wi-Fi', 'Mess', 'Academic', 'Other'
    urgency TEXT NOT NULL DEFAULT 'Medium', -- 'Low', 'Medium', 'High', 'Critical'
    block TEXT DEFAULT 'Unknown',
    floor TEXT DEFAULT 'Unknown',
    room TEXT DEFAULT 'Unknown',
    problem_details TEXT NOT NULL,
    confidence_score NUMERIC(5,2) NOT NULL, -- e.g. 94.50
    routing_status TEXT NOT NULL DEFAULT 'AUTO_ROUTED', -- 'AUTO_ROUTED', 'HUMAN_REVIEW', 'MANUALLY_ROUTED'
    assigned_department TEXT NOT NULL, -- 'Plumbing', 'Electrical', 'Wi-Fi', 'Mess', 'Academic', 'Campus Facilities'
    assigned_technician TEXT,
    status TEXT NOT NULL DEFAULT 'Pending', -- 'Pending', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed'
    resolution_notes TEXT,
    processing_latency_ms INTEGER DEFAULT 320,
    api_cost_usd NUMERIC(8,6) DEFAULT 0.000125,
    tokens_used INTEGER DEFAULT 450,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 3. Create Ticket Audit Logs / Timeline Table
CREATE TABLE IF NOT EXISTS ticket_timeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    actor TEXT NOT NULL, -- 'CampusCare AI Engine', 'System Router', 'Admin Staff', 'Student'
    details TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS) & Public Policies for Demo
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to complaints" 
ON complaints FOR SELECT USING (true);

CREATE POLICY "Allow public insert to complaints" 
ON complaints FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to complaints" 
ON complaints FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to timeline" 
ON ticket_timeline FOR SELECT USING (true);

CREATE POLICY "Allow public insert to timeline" 
ON ticket_timeline FOR INSERT WITH CHECK (true);

-- 5. Seed Initial University Complaints
INSERT INTO complaints (
    ticket_number, student_name, student_id, student_email, student_phone,
    raw_text, detected_language, category, urgency, block, floor, room,
    problem_details, confidence_score, routing_status, assigned_department,
    status, processing_latency_ms, api_cost_usd, tokens_used
) VALUES 
(
    'CC-2026-101', 'Arjun Sharma', '2023CSB1042', 'arjun.s@campus.edu', '+91 98765 43210',
    'Room 304, Block B vich paani tapak reha hai ceiling ton, please jaldi koi plumber bhejo nahi ta poora kamra kharab ho jauga.',
    'Punjabi', 'Plumbing', 'High', 'Block B', '3rd Floor', 'Room 304',
    'Continuous water dripping from ceiling risking room damage', 93.5, 'AUTO_ROUTED', 'Plumbing',
    'In Progress', 340, 0.000140, 480
),
(
    'CC-2026-102', 'Priya Verma', '2024ECE089', 'priya.v@campus.edu', '+91 98111 22334',
    'Mess ka khana kal raat se bilkul kharab aa raha hai, daal mein se smell aa rahi thi aur rotis are completely burnt.',
    'Hinglish', 'Mess', 'High', 'Hostel Mess Hall', 'Ground Floor', 'Dining Area 2',
    'Spoiled food with foul smell in daal and burnt rotis served to students', 91.0, 'AUTO_ROUTED', 'Mess',
    'Assigned', 290, 0.000118, 410
),
(
    'CC-2026-103', 'Rohan Preet Singh', '2022MECH310', 'rohan.p@campus.edu', '+91 97222 33445',
    'Boys Hostel 3 de 2nd floor switchboard cho spark nikal reha hai, smell of burning plastic! Bahut dangerous hai.',
    'Punjabi', 'Electrical', 'Critical', 'Boys Hostel 3', '2nd Floor', 'Corridor near Room 214',
    'Active electrical sparking from switchboard with burning plastic odor; high fire hazard', 97.8, 'AUTO_ROUTED', 'Electrical',
    'Pending', 265, 0.000132, 455
),
(
    'CC-2026-104', 'Tanvi Mehta', '2023CSE211', 'tanvi.m@campus.edu', '+91 99888 77665',
    'Central Library 1st Floor wing C Wi-Fi drops every 2 minutes. Gateway latency is 800ms+, cannot load IEEE papers.',
    'English', 'Wi-Fi', 'Medium', 'Central Library', '1st Floor', 'Wing C Study Cubicles',
    'Intermittent Wi-Fi dropping every 2 mins with 800ms+ latency affecting study', 95.2, 'AUTO_ROUTED', 'Wi-Fi',
    'Resolved', 310, 0.000125, 430
),
(
    'CC-2026-105', 'Jaswinder Kaur', '2024BT015', 'jaswinder.k@campus.edu', '+91 98777 66554',
    'Kuch ajeeb jehi awaaz aa rahi hai hostel back side ton, shayad koi taar ya AC fan phasiya hoya hai.',
    'Punjabi', 'Other', 'Low', 'Girls Hostel', 'Rear Ground', 'Behind Block A',
    'Unusual humming sound reported behind hostel block; ambiguous equipment location', 64.0, 'HUMAN_REVIEW', 'Campus Facilities',
    'Under Review', 480, 0.000160, 520
),
(
    'CC-2026-106', 'Aditya Nair', '2023CH102', 'aditya.n@campus.edu', '+91 96555 44332',
    'Lecture Hall 4 projector has broken HDMI port and blue tint flickering. Prof said to submit complaint.',
    'English', 'Academic', 'Medium', 'Academic Complex', 'Ground Floor', 'Lecture Hall 4 (LH-4)',
    'Faulty projector with defective HDMI connection and severe blue flicker', 92.4, 'AUTO_ROUTED', 'Academic',
    'Assigned', 305, 0.000120, 420
)
ON CONFLICT (ticket_number) DO NOTHING;
