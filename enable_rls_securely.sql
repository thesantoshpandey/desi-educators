-- SECURELY RE-ENABLE RLS (With Admin Access Protection)
-- 1. TURN IT BACK ON
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- 2. CREATE A "SECURITY DEFINER" HELPER FUNCTION
-- This function runs with "Superuser" privileges properly to check your role without getting blocked by the lock we just added.
-- This prevents the "Infinite Recursion" error where checking access requires checking access.
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER
SET search_path = public AS $$
SELECT EXISTS (
        SELECT 1
        FROM profiles
        WHERE id = auth.uid()
            AND role = 'admin'
    );
$$;
-- 3. DROP OLD/BROKEN POLICIES
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles" ON profiles;
-- 4. CREATE ROBUST POLICIES
-- Policy A: Everyone can read their OWN profile (Critical for the App to know who you are)
CREATE POLICY "Users can read own profile" ON profiles FOR
SELECT USING (auth.uid() = id);
-- Policy B: Admins can read EVERYONE'S profile (Critical for Admin Panel > Users list)
-- Uses the helper function to bypass the lock safely
CREATE POLICY "Admins can read all profiles" ON profiles FOR
SELECT USING (is_admin());
-- Policy C: Admins can update profiles (promote/block users)
CREATE POLICY "Admins can update profiles" ON profiles FOR
UPDATE USING (is_admin());
-- Policy D: Users can update their OWN profile (optional, for profile page)
CREATE POLICY "Users can update own profile" ON profiles FOR
UPDATE USING (auth.uid() = id);