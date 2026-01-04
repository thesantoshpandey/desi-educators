-- ==============================================================================
-- Security Hardening Script
-- Run this in Supabase Dashboard -> SQL Editor
-- ==============================================================================
-- 1. CLOSE LOOPHOLE: Prevent client-side inserts
DROP POLICY IF EXISTS "Users can insert own enrollments" ON public.enrollments;
-- 2. ADMIN ACCESS: Allow Admin to see ALL Orders
-- This allows the dashboard to calculate total revenue and show recent orders.
-- Replacing 'vishal.pandey1912@gmail.com' with your actual admin email.
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders" ON public.orders FOR
SELECT USING (
        auth.jwt()->>'email' = 'vishal.pandey1912@gmail.com'
        OR auth.uid() = user_id -- Keep their own access too
    );
-- 3. ADMIN ACCESS: Allow Admin to see ALL Enrollments
-- Useful for debugging student access issues.
DROP POLICY IF EXISTS "Admins can view all enrollments" ON public.enrollments;
CREATE POLICY "Admins can view all enrollments" ON public.enrollments FOR
SELECT USING (
        auth.jwt()->>'email' = 'vishal.pandey1912@gmail.com'
        OR auth.uid() = user_id
    );
-- Note: We do NOT adding INSERT policies for Admin, 
-- because edits should still happen via the secure Payment API to ensure consistency.