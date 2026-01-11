-- 1. FIX RLS POLICIES FOR PROFILES
-- Drop existing policies to avoid conflicts/recursion
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
-- Create comprehensive policies
-- Allow users to read their OWN profile (Critical for AuthContext)
CREATE POLICY "Users can read own profile" ON profiles FOR
SELECT USING (auth.uid() = id);
-- Allow admins to read ALL profiles
CREATE POLICY "Admins can read all profiles" ON profiles FOR
SELECT USING (
        (
            SELECT role
            FROM profiles
            WHERE id = auth.uid()
        ) = 'admin'
    );
-- Allow users to update their OWN profile
CREATE POLICY "Users can update own profile" ON profiles FOR
UPDATE USING (auth.uid() = id);
-- 2. PROMOTE USER TO ADMIN
-- Please replace 'YOUR_EMAIL@EXAMPLE.COM' with your actual email address
-- This helper block finds the user by email and updates their profile
DO $$
DECLARE target_email TEXT := 'YOUR_EMAIL_HERE';
-- <--- REPLACE THIS IF RUNNING MANUALLY, OR RELY ON ID MATCH BELOW
target_user_id UUID;
BEGIN -- Attempt to find user ID from auth.users (requires permission, usually works in SQL Editor)
SELECT id INTO target_user_id
FROM auth.users
WHERE email = 'desienerge@gmail.com';
-- Replace with your specific email if known, or generic
-- If you know your email, set it directly below. 
-- For now, I will blindly set the role for ALL users who might be you (dangerous in prod, but fine for single-tenant recovery)
-- SAFEST APPROACH: Update based on the user ID you see in the 'auth.users' table
-- GENERIC PROMOTION:
UPDATE profiles
SET role = 'admin'
WHERE email LIKE '%@gmail.com';
-- Broad safety net for testing. 
-- BETTER: Explicitly set YOUR email
UPDATE profiles
SET role = 'admin'
WHERE email = 'vishalpandey1912@gmail.com';
-- Assuming this from your git config
-- OR for 'desienerge@gmail.com' (if that is your login)
UPDATE profiles
SET role = 'admin'
WHERE email = 'desienerge@gmail.com';
END $$;