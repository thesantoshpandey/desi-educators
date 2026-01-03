-- FIX: RLS Performance Warnings (Initialization Plan & Multiple Permissive Policies)
-- ==============================================================================
-- 1. QUIZ ATTEMPTS
-- Issue: Re-evaluation of auth.uid()
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
-- Issue: Multiple permissive policies (Admin ALL + Public SELECT) & Re-evaluation
-- Strategy: Split Admin policy into write-only + Unified SELECT policy
-- ==============================================================================
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
-- Unified SELECT: Public sees active, Admins see everything
CREATE POLICY "Unified view products" ON public.products FOR
SELECT USING (
        is_active = true
        OR (
            (
                select auth.jwt()->>'email'
            ) = 'vishal.pandey1912@gmail.com'
            OR (
                select role
                from public.profiles
                where id = (
                        select auth.uid()
                    )
            ) = 'admin'
        )
    );
-- Admin WRITE privileges (Insert, Update, Delete)
CREATE POLICY "Admins can insert products" ON public.products FOR
INSERT TO authenticated WITH CHECK (
        (
            select auth.jwt()->>'email'
        ) = 'vishal.pandey1912@gmail.com'
        OR (
            select role
            from public.profiles
            where id = (
                    select auth.uid()
                )
        ) = 'admin'
    );
CREATE POLICY "Admins can update products" ON public.products FOR
UPDATE TO authenticated USING (
        (
            select auth.jwt()->>'email'
        ) = 'vishal.pandey1912@gmail.com'
        OR (
            select role
            from public.profiles
            where id = (
                    select auth.uid()
                )
        ) = 'admin'
    );
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE TO authenticated USING (
    (
        select auth.jwt()->>'email'
    ) = 'vishal.pandey1912@gmail.com'
    OR (
        select role
        from public.profiles
        where id = (
                select auth.uid()
            )
    ) = 'admin'
);
-- ==============================================================================
-- 3. COUPONS
-- Issue: Sames as Products
-- ==============================================================================
DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;
DROP POLICY IF EXISTS "Public can view coupons" ON public.coupons;
-- Unified SELECT
CREATE POLICY "Unified view coupons" ON public.coupons FOR
SELECT USING (
        active = true
        OR (
            (
                select auth.jwt()->>'email'
            ) = 'vishal.pandey1912@gmail.com'
            OR (
                select role
                from public.profiles
                where id = (
                        select auth.uid()
                    )
            ) = 'admin'
        )
    );
-- Admin WRITE privileges
CREATE POLICY "Admins can insert coupons" ON public.coupons FOR
INSERT TO authenticated WITH CHECK (
        (
            select auth.jwt()->>'email'
        ) = 'vishal.pandey1912@gmail.com'
        OR (
            select role
            from public.profiles
            where id = (
                    select auth.uid()
                )
        ) = 'admin'
    );
CREATE POLICY "Admins can update coupons" ON public.coupons FOR
UPDATE TO authenticated USING (
        (
            select auth.jwt()->>'email'
        ) = 'vishal.pandey1912@gmail.com'
        OR (
            select role
            from public.profiles
            where id = (
                    select auth.uid()
                )
        ) = 'admin'
    );
CREATE POLICY "Admins can delete coupons" ON public.coupons FOR DELETE TO authenticated USING (
    (
        select auth.jwt()->>'email'
    ) = 'vishal.pandey1912@gmail.com'
    OR (
        select role
        from public.profiles
        where id = (
                select auth.uid()
            )
    ) = 'admin'
);
-- ==============================================================================
-- 4. PROFILES
-- Issue: Re-evaluation & Multiple Policies
-- Note: 'Public profiles are viewable by everyone' usually duplicates specific access
-- ==============================================================================
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
-- We keep 'Users can view own profile' and 'Public profiles...' if they exist, 
-- but optimize the Admin override. Since 'Public profiles' (if it exists) might 
-- only show public info, Admins need full access. 
-- To avoid "Multiple Permissive", we ideally merge, but Profiles is complex.
-- Let's just fix the "InitPlan" warning for the Admin policy for now by wrapping auth calls.
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR
SELECT TO authenticated USING (
        (
            select auth.jwt()->>'email'
        ) = 'vishal.pandey1912@gmail.com'
        OR (
            select role
            from public.profiles
            where id = (
                    select auth.uid()
                )
        ) = 'admin'
    );