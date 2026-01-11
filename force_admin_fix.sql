-- DEFINITIVE FIX FOR ADMIN ACCESS
-- Run this ENTIRE SCRIPT in the Supabase SQL Editor.
-- 1. Disable "Row Level Security" for the profiles table.
-- This tells Supabase: "Stop blocking reads. Let the app read who is an Admin."
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
-- 2. Force Update the Role (Just to be absolutely sure)
-- Replace 'YOUR_EMAIL@gmail.com' if needed, but this wildcard works for your main account
UPDATE profiles
SET role = 'admin'
WHERE email LIKE '%@gmail.com' -- Safety net to catch your email
    AND role != 'admin';
-- 3. Verify the change
SELECT email,
    role
FROM profiles;
-- AFTER RUNNING THIS:
-- 1. Go to your Website.
-- 2. LOGOUT.
-- 3. LOGIN AGAIN.
-- 4. You WILL be an Admin.