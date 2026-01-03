-- FIX: Student Names Display in Admin Dashboard
-- 1. Ensure 'role' column exists in public.profiles
-- The error "column 'role' does not exist" indicates this is missing.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role text DEFAULT 'student';
-- 2. Update handle_new_user to correctly capture metadata
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$ BEGIN
INSERT INTO public.profiles (id, email, name, role)
VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'name', 'New Student'),
        'student' -- Default role
    );
RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;
-- 3. Backfill missing names and Ensure Role is set
UPDATE public.profiles p
SET name = COALESCE(u.raw_user_meta_data->>'name', 'Student'),
    role = COALESCE(p.role, 'student')
FROM auth.users u
WHERE p.id = u.id
    AND (
        p.name IS NULL
        OR p.name = ''
        OR p.name = 'Unknown'
        OR p.role IS NULL
    );
-- 4. Optimize RLS for Admin Access
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR
SELECT TO authenticated USING (
        auth.jwt()->>'email' = 'vishal.pandey1912@gmail.com'
        OR (
            SELECT role
            FROM public.profiles
            WHERE id = auth.uid()
        ) = 'admin'
    );