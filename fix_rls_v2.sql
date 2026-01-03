-- FIX: RLS Optimization V2 (Consolidated Policies & Helper Function)
-- ==============================================================================
-- 0. HELPER FUNCTION
-- Encapsulates Admin check (Email + Role) in a SECURITY DEFINER function
-- This avoids RLS recursion on public.profiles and is cleaner.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.check_is_admin() RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public STABLE AS $$ BEGIN -- 1. Check Super Admin Email (Fastest)
    IF (auth.jwt()->>'email') = 'vishal.pandey1912@gmail.com' THEN RETURN true;
END IF;
-- 2. Check Database Role
-- Security Definer allows this to bypass RLS on profiles table itself
RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
        AND role = 'admin'
);
END;
$$;
-- ==============================================================================
-- 1. QUIZ ATTEMPTS
-- ==============================================================================
DROP POLICY IF EXISTS "Users can view own attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Users can insert own attempts" ON public.quiz_attempts;
CREATE POLICY "Users can view own attempts" ON public.quiz_attempts FOR
SELECT TO authenticated USING (
        user_id = (
            select auth.uid()
        )
    );
CREATE POLICY "Users can insert own attempts" ON public.quiz_attempts FOR
INSERT TO authenticated WITH CHECK (
        user_id = (
            select auth.uid()
        )
    );
-- ==============================================================================
-- 2. PRODUCTS
-- Fix: Use is_active, Consolidate Policies
-- ==============================================================================
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
DROP POLICY IF EXISTS "Unified view products" ON public.products;
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
-- Unified SELECT (Public + Admin)
CREATE POLICY "View products" ON public.products FOR
SELECT USING (
        is_active = true
        OR (
            select public.check_is_admin()
        )
    );
-- Admin WRITE Policies
CREATE POLICY "Manage products" ON public.products FOR ALL TO authenticated USING (
    (
        select public.check_is_admin()
    )
) WITH CHECK (
    (
        select public.check_is_admin()
    )
);
-- ==============================================================================
-- 3. COUPONS
-- ==============================================================================
DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;
DROP POLICY IF EXISTS "Public can view coupons" ON public.coupons;
DROP POLICY IF EXISTS "Unified view coupons" ON public.coupons;
DROP POLICY IF EXISTS "Admins can insert coupons" ON public.coupons;
DROP POLICY IF EXISTS "Admins can update coupons" ON public.coupons;
DROP POLICY IF EXISTS "Admins can delete coupons" ON public.coupons;
-- Unified SELECT
CREATE POLICY "View coupons" ON public.coupons FOR
SELECT USING (
        active = true
        OR (
            select public.check_is_admin()
        )
    );
-- Admin WRITE
CREATE POLICY "Manage coupons" ON public.coupons FOR ALL TO authenticated USING (
    (
        select public.check_is_admin()
    )
) WITH CHECK (
    (
        select public.check_is_admin()
    )
);
-- ==============================================================================
-- 4. PROFILES
-- Consolidate ALL Select policies to avoid "Multiple Permissive Policies" warning
-- ==============================================================================
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
-- Drop any potential duplicates from previous attempts
DROP POLICY IF EXISTS "Unified profile view" ON public.profiles;
CREATE POLICY "Unified profile view" ON public.profiles FOR
SELECT TO authenticated USING (
        -- User sees own
        id = (
            select auth.uid()
        )
        OR -- Admin sees all
        (
            select public.check_is_admin()
        )
    );
-- Ensure Users can UPDATE their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR
UPDATE TO authenticated USING (
        id = (
            select auth.uid()
        )
    ) WITH CHECK (
        id = (
            select auth.uid()
        )
    );
-- Ensure Users can INSERT their own profile (Trigger handles this usually, but good to have)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR
INSERT TO authenticated WITH CHECK (
        id = (
            select auth.uid()
        )
    );