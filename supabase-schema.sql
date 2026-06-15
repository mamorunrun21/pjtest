-- 
-- Supabase Table Schema Setup for construction schedule whiteboard App
-- Run this script in the Supabase Dashboard -> SQL Editor
-- 

-- 1. Create Members Table
CREATE TABLE public.members (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    color TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Tasks Table
CREATE TABLE public.tasks (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    progress INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'not_started',
    assignees TEXT[] DEFAULT '{}'::text[], -- String array for member id assignments
    notes TEXT,
    "order" INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Logs Table
CREATE TABLE public.update_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    task_id TEXT NOT NULL,
    task_title TEXT NOT NULL,
    member_name TEXT NOT NULL,
    prev_status TEXT NOT NULL,
    new_status TEXT NOT NULL,
    prev_progress INTEGER NOT NULL,
    new_progress INTEGER NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS (Optional, can be modified in your dashboard)
-- By default, for public access using anon key, you can enable read/write policies:
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.update_logs ENABLE ROW LEVEL SECURITY;

-- Anonymous CRUD policies (allow easy frontend integration)
CREATE POLICY "Allow anonymous read all" ON public.members FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert" ON public.members FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON public.members FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete" ON public.members FOR DELETE USING (true);

CREATE POLICY "Allow anonymous read all tasks" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert tasks" ON public.tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update tasks" ON public.tasks FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete tasks" ON public.tasks FOR DELETE USING (true);

CREATE POLICY "Allow anonymous read all logs" ON public.update_logs FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert logs" ON public.update_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous delete logs" ON public.update_logs FOR DELETE USING (true);
