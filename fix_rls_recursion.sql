-- ========================================================================
-- RLS INFINITE RECURSION FIX
-- The Class Repository original SQL contained a recursive policy bug on `public.users`
-- which crashed auth queries. This aggressively strips them out.
-- ========================================================================

-- 1. Drop the critically bugged recursive policies from the class repository script
DROP POLICY IF EXISTS "admins_all_users" ON public.users;
DROP POLICY IF EXISTS "admins_all_kids" ON public.kids;
DROP POLICY IF EXISTS "admins_insert_sessions" ON public.sessions;
DROP POLICY IF EXISTS "admins_insert_classes" ON public.classes;

-- 2. Ensure all tables fall back safely to our completely unified 'allow_all' rule for the MVP Video Demo
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
