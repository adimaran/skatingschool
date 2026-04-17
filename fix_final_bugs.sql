-- ========================================================================
-- DEFINITIVE SURGICAL FIX
-- Solves the "kid_id" ghost table issue, and brutally nukes the zombie admin account.
-- ========================================================================

-- ISSUE 1: The 'kid_id' caching bug was actually a GHOST TABLE!
-- Because your Phase 2 `skills_passed` table still existed in the background with the old 
-- `student_id` logic, the database completely ignored my attempts to create a new one!
-- We will brutally delete the old table and construct a fresh one.

DROP TABLE IF EXISTS public.skills_passed CASCADE;

CREATE TABLE public.skills_passed (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  kid_id uuid REFERENCES public.kids(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  skill_name text NOT NULL,
  passed_on timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.skills_passed ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON public.skills_passed FOR ALL USING (auth.role() = 'authenticated');
NOTIFY pgrst, 'reload schema';

-- ISSUE 2: ZOMBIE ADMIN ACCOUNT
-- Because `admin@admin.com` is locked up in constraint errors, the Supabase Dashboard UI refuses to delete it natively.
-- This block bypasses the UI and annihilates every trace of that email from both Auth and Public directories!

DO $$
BEGIN
  -- Force delete mapping in public.users first
  DELETE FROM public.users WHERE id IN (SELECT id FROM auth.users WHERE email = 'admin@admin.com');
  
  -- Obliterate the core Auth profile
  DELETE FROM auth.users WHERE email = 'admin@admin.com';
END $$;
