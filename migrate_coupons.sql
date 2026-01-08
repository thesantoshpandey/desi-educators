-- ==========================================
-- COUPONS MIGRATION (VERIFIED SCHEMA)
-- ==========================================
-- 1. Create Coupons Table (Schema matches yours)
-- Columns: code, discount, type, active
CREATE TABLE IF NOT EXISTS public.coupons (
    code text PRIMARY KEY,
    discount numeric NOT NULL,
    type text NOT NULL CHECK (type IN ('percent', 'flat')),
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);
-- 2. Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
-- 3. Policy
DROP POLICY IF EXISTS "Apps can read active coupons" ON public.coupons;
CREATE POLICY "Apps can read active coupons" ON public.coupons FOR
SELECT USING (active = true);
-- 4. Seed Data (Using correct columns)
INSERT INTO public.coupons (code, discount, type)
VALUES ('WELCOME50', 50, 'percent'),
    ('NEET2026', 1000, 'flat'),
    ('PHYSICS30', 30, 'percent') ON CONFLICT (code) DO NOTHING;