-- ==========================================
-- COUPONS MIGRATION (Supabase)
-- ==========================================
-- 1. Create Coupons Table
CREATE TABLE IF NOT EXISTS public.coupons (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    code text NOT NULL UNIQUE,
    discount_value numeric NOT NULL,
    discount_type text NOT NULL CHECK (discount_type IN ('percent', 'flat')),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);
-- 2. Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
-- 3. Public Verification Policy
-- Users need to "read" the coupon to check if it matches.
-- Or better: A secure setup where they can only read ACTIVE coupons.
DROP POLICY IF EXISTS "Apps can read active coupons" ON public.coupons;
CREATE POLICY "Apps can read active coupons" ON public.coupons FOR
SELECT USING (is_active = true);
-- 4. Seed Initial Coupons (from your previous localStorage logic)
INSERT INTO public.coupons (code, discount_value, discount_type)
VALUES ('WELCOME50', 50, 'percent'),
    ('NEET2026', 1000, 'flat'),
    ('PHYSICS30', 30, 'percent') ON CONFLICT (code) DO NOTHING;