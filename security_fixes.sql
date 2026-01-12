-- ==============================================================================
-- FINAL SECURITY HARDENING SCRIPT (PRODUCTION SAFE)
-- Run this ONCE in Supabase Dashboard -> SQL Editor
-- ==============================================================================
-- ------------------------------------------------------------------------------
-- 1. CLOSE CRITICAL LOOPHOLE
-- Prevent users from inserting or modifying enrollments directly
-- Enrollment must ONLY happen via secure server/webhook logic
-- ------------------------------------------------------------------------------
-- Drop common variations of the insert policy to ensure cleanup
DROP POLICY IF EXISTS "Users can insert own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON public.enrollments;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.enrollments;
-- Added common default name
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.enrollments;
-- ------------------------------------------------------------------------------
-- 2. ENSURE ADMIN ROLE CHECK FUNCTION EXISTS
-- This function safely checks admin role without RLS recursion
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER
SET search_path = public AS $$
SELECT EXISTS (
        SELECT 1
        FROM profiles
        WHERE id = auth.uid()
            AND role = 'admin'
    );
$$;
-- ------------------------------------------------------------------------------
-- 3. ORDERS TABLE POLICIES
-- - Users can see their own orders
-- - Admins can see ALL orders (for revenue & dashboard)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders" ON public.orders FOR
SELECT USING (is_admin());
-- ------------------------------------------------------------------------------
-- 4. ENROLLMENTS TABLE POLICIES
-- - Users can see their own enrollments
-- - Admins can see ALL enrollments
-- - NO client-side inserts or updates allowed
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Admins can view all enrollments" ON public.enrollments;
CREATE POLICY "Users can view own enrollments" ON public.enrollments FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all enrollments" ON public.enrollments FOR
SELECT USING (is_admin());
-- ------------------------------------------------------------------------------
-- 5. IMPORTANT NOTE (INTENTIONAL DESIGN)
-- We DO NOT add INSERT or UPDATE policies for enrollments.
-- All enrollment creation MUST happen via:
-- - Razorpay webhook
-- - Secure server-side API using service role
-- ------------------------------------------------------------------------------
-- END OF SCRIPT