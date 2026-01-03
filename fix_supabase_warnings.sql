-- COMPREHENSIVE FIX FOR SUPABASE WARNINGS
-- Run this entire script in your Supabase SQL Editor.
-- SECTION 1: Fix "Auth RLS Initialization Plan" (Performance)
-- Issue: auth.uid() is re-evaluated for every row.
-- Fix: Wrap in (select auth.uid()).
-- 1.1 Fix for 'profiles' table (If not already done)
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR
INSERT TO authenticated WITH CHECK (
        id = (
            select auth.uid()
        )
    );
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR
UPDATE TO authenticated USING (
        id = (
            select auth.uid()
        )
    );
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR
SELECT TO authenticated USING (
        id = (
            select auth.uid()
        )
    );
-- 1.2 Fix for 'orders' table (Assuming this table exists and has user_id)
-- Adjust policy names if yours are different.
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders FOR
SELECT TO authenticated USING (
        user_id = (
            select auth.uid()
        )
    );
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
CREATE POLICY "Users can insert own orders" ON public.orders FOR
INSERT TO authenticated WITH CHECK (
        user_id = (
            select auth.uid()
        )
    );
-- 1.3 Fix for 'enrollments' table
DROP POLICY IF EXISTS "Users can view own enrollments" ON public.enrollments;
CREATE POLICY "Users can view own enrollments" ON public.enrollments FOR
SELECT TO authenticated USING (
        user_id = (
            select auth.uid()
        )
    );
-- SECTION 2: Fix "Multiple Permissive Policies" (Security)
-- Issue: You might have policies that allow 'public' (anon) access unnecessarily.
-- Fix: Restrict to 'authenticated' role where possible.
-- Example: If you have a policy "Enable access to all users", check if it allows writing.
-- This part acts as a safeguard.
-- Ensure only authenticated users can insert into orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
-- (The INSERT policy above restricts it, but ensure no "true" policy exists)
-- DROP POLICY IF EXISTS "Enable insert for all" ON public.orders;
-- SECTION 3: Add Missing Indexes (Bonus Performance Fix)
-- Often caused by RLS policies filtering on columns without indexes.
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON public.enrollments(user_id);