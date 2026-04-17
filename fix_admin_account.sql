-- ========================================================================
-- ADVANCED ADMIN AUTHENTICATION PATCH
-- Resolves the core Supabase API bug where missing 'aud' fields block login
-- ========================================================================

DO $$
DECLARE
  new_admin_id uuid := gen_random_uuid();
  instance_id_val uuid := '00000000-0000-0000-0000-000000000000'::uuid;
BEGIN
  -- Strip out broken seed accounts
  DELETE FROM auth.users WHERE email IN ('frank@admin.com', 'admin@admin.com');
  DELETE FROM public.users WHERE id IN (SELECT id FROM auth.users WHERE email IN ('frank@admin.com', 'admin@admin.com'));

  -- Inject admin@admin.com directly with the critical 'aud' and 'role' GoTrue parameters
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (
    new_admin_id,
    instance_id_val,
    'authenticated', -- CRITICAL: GoTrue will reject the login with "Invalid Credentials" if aud is null!
    'authenticated',
    'admin@admin.com',
    crypt('south', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now()
  );

  -- Force public mapping
  INSERT INTO public.users (id, role) VALUES (new_admin_id, 'admin');

END $$;
