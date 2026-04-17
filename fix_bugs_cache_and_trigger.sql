-- ========================================================================
-- DEBUG RESOLUTION PATCH
-- Fixes the API Schema Caching and the broken Signup Trigger mapping.
-- ========================================================================

-- ISSUE 1 FIX: Reload the Supabase API Schema Cache
-- Because we built new tables dynamically while the API was running, the PostgREST proxy
-- didn't update its internal cache fast enough to 'see' the newly added kid_id column!
NOTIFY pgrst, 'reload schema';

-- ISSUE 2 FIX: Rebuild the Auth Trigger
-- Your Phase 1 trigger was still blindly trying to insert new users into the old `profiles` table.
-- Because that table was deleted by the Class Schema, the database was violently throwing a 
-- "Database Error" and blocking any new users from being created! Let's map it to `users`.

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- We safely insert the new user into the correct class schema `users` table
  INSERT INTO public.users (id, role)
  VALUES (
    NEW.id, 
    -- If no role is provided securely, default to parent
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'parent'::public.user_role)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
