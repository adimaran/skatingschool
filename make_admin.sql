-- ========================================================================
-- INSTANT ADMIN PROMOTION PATCH
-- Promotes the newly created user from 'parent' to 'admin'
-- ========================================================================

UPDATE public.users 
SET role = 'admin' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@admin.com');
