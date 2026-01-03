-- FIX: RLS Optimization V3 (Final Conflict Resolution)
-- Goal: Ensure exactly ONE policy per action per role to silence "Multiple Permissive Policies" warnings.
-- ==============================================================================
-- 1. PRODUCTS
-- Problem: 'Manage products' (ALL) overlapped with 'View products' (SELECT).
-- Fix: Split 'Manage' into INSERT, UPDATE, DELETE.
-- ==============================================================================
DROP POLICY IF EXISTS "Manage products" ON public.products;
DROP POLICY IF EXISTS "View products" ON public.products;
DROP POLICY IF EXISTS "Unified view products" ON public.products;
-- Cleanup old names just in case
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
-- 1. Single SELECT Policy (Handles both Public & Admin visibility)
CREATE POLICY "View products" ON public.products FOR
SELECT USING (
        is_active = true
        OR (
            select public.check_is_admin()
        )
    );
-- 2. Explicit WRITE Policies (Admin Only)
CREATE POLICY "Insert products" ON public.products FOR
INSERT TO authenticated WITH CHECK (
        (
            select public.check_is_admin()
        )
    );
CREATE POLICY "Update products" ON public.products FOR
UPDATE TO authenticated USING (
        (
            select public.check_is_admin()
        )
    ) WITH CHECK (
        (
            select public.check_is_admin()
        )
    );
CREATE POLICY "Delete products" ON public.products FOR DELETE TO authenticated USING (
    (
        select public.check_is_admin()
    )
);
-- ==============================================================================
-- 2. COUPONS
-- Problem: Same overlap as products.
-- Fix: Split 'Manage' into INSERT, UPDATE, DELETE.
-- ==============================================================================
DROP POLICY IF EXISTS "Manage coupons" ON public.coupons;
DROP POLICY IF EXISTS "View coupons" ON public.coupons;
DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;
DROP POLICY IF EXISTS "Public can view coupons" ON public.coupons;
-- 1. Single SELECT Policy
CREATE POLICY "View coupons" ON public.coupons FOR
SELECT USING (
        active = true
        OR (
            select public.check_is_admin()
        )
    );
-- 2. Explicit WRITE Policies
CREATE POLICY "Insert coupons" ON public.coupons FOR
INSERT TO authenticated WITH CHECK (
        (
            select public.check_is_admin()
        )
    );
CREATE POLICY "Update coupons" ON public.coupons FOR
UPDATE TO authenticated USING (
        (
            select public.check_is_admin()
        )
    ) WITH CHECK (
        (
            select public.check_is_admin()
        )
    );
CREATE POLICY "Delete coupons" ON public.coupons FOR DELETE TO authenticated USING (
    (
        select public.check_is_admin()
    )
);
-- ==============================================================================
-- 3. PROFILES
-- Problem: Two INSERT policies existed ("Users can insert own profile" vs "Users can insert their own profile")
-- Fix: Drop the legacy one.
-- ==============================================================================
-- Drop the specific legacy policy identified in the logs
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
-- Ensure the intended one exists (idempotent check not strictly needed if v2 ran, but safe)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR
INSERT TO authenticated WITH CHECK (
        id = (
            select auth.uid()
        )
    );