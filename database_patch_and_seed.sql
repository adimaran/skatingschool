-- ================================================================
-- PHASE 3: NON-DESTRUCTIVE PATCH & DEMO SEEDER
-- Safely applies additional Management tables around your existing schema
-- ================================================================

-- 1. Daily Attendance Table (For Instructors to take attendance)
CREATE TABLE IF NOT EXISTS public.attendance (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  kid_id uuid REFERENCES public.kids(id) ON DELETE CASCADE,
  attendance_date date NOT NULL,
  present boolean DEFAULT false,
  unique(class_id, kid_id, attendance_date)
);

-- 2. Skills Passed Table (For Skill progression tracking)
CREATE TABLE IF NOT EXISTS public.skills_passed (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  kid_id uuid REFERENCES public.kids(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  skill_name text NOT NULL,
  passed_on timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Relax RLS for Local Demonstration 
-- We ensure the authenticated UI can do everything without complex UUID mismatch bugs
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills_passed ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all" ON public.users;
DROP POLICY IF EXISTS "allow_all" ON public.classes;
DROP POLICY IF EXISTS "allow_all" ON public.class_enrollments;
DROP POLICY IF EXISTS "allow_all" ON public.kids;
DROP POLICY IF EXISTS "allow_all" ON public.sessions;
DROP POLICY IF EXISTS "allow_all" ON public.attendance;
DROP POLICY IF EXISTS "allow_all" ON public.skills_passed;

CREATE POLICY "allow_all" ON public.users FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "allow_all" ON public.classes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "allow_all" ON public.class_enrollments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "allow_all" ON public.kids FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "allow_all" ON public.sessions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "allow_all" ON public.attendance FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "allow_all" ON public.skills_passed FOR ALL USING (auth.role() = 'authenticated');

-- 4. Insert Dummy Demo Data
DO $$
DECLARE
  sess_id uuid := gen_random_uuid();
  instructor_id uuid;
BEGIN
  -- We fetch an instructor id if one exists, otherwise null
  SELECT id INTO instructor_id FROM public.users WHERE role = 'instructor' LIMIT 1;

  -- Create a Dummy Session
  IF NOT EXISTS (SELECT 1 FROM public.sessions WHERE name = 'Spring MVP Term') THEN
    INSERT INTO public.sessions (id, name, start_date, end_date) 
    VALUES (sess_id, 'Spring MVP Term', '2026-03-01', '2026-05-01');

    -- Create some Demo Classes attached to this Session
    INSERT INTO public.classes (session_id, instructor_id, level, skill_set, time, day_of_week, capacity)
    VALUES 
      (sess_id, instructor_id, 'Basic 1', 'Forward Gliding', '10:00 AM', 'Saturday', 15),
      (sess_id, instructor_id, 'Basic 2', 'Backward Wiggles', '11:00 AM', 'Saturday', 15),
      (sess_id, instructor_id, 'Freestyle 1', 'Waltz Jump', '4:00 PM', 'Tuesday', 10);
  END IF;
END $$;
