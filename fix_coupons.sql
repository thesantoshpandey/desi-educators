-- ==========================================
-- FIX COUPONS POLICY
-- ==========================================
-- 1. Ensure RLS is on
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
-- 2. Drop any old policies
DROP POLICY IF EXISTS "Apps can read active coupons" ON public.coupons;
-- 3. Create correct policy using 'active' column
CREATE POLICY "Apps can read active coupons" ON public.coupons FOR
SELECT USING (active = true);