-- ==========================================
-- 1. Create 'products' table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.products (
    id text PRIMARY KEY,
    name text NOT NULL,
    description text,
    price numeric NOT NULL,
    type text NOT NULL,
    -- 'bundle', 'subject', 'test_series', etc.
    target_ids text [],
    -- Array of IDs this unlocks
    features text [],
    -- Array of feature strings
    is_active boolean DEFAULT true,
    is_recommended boolean DEFAULT false,
    color text,
    image text,
    created_at timestamp with time zone DEFAULT now()
);
-- ==========================================
-- 2. Enable RLS
-- ==========================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
-- Allow public read access (viewing pricing)
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products" ON public.products FOR
SELECT USING (is_active = true);
-- Optionally allow admins to insert/update (if needed later)
-- For now, we seed via SQL.
-- ==========================================
-- 3. Seed Default Products
-- ==========================================
INSERT INTO public.products (
        id,
        name,
        description,
        price,
        type,
        target_ids,
        features,
        is_active,
        is_recommended,
        color
    )
VALUES (
        'full-year',
        'NEET 2026 Full Course',
        'Complete access to Physics, Chemistry, and Biology',
        14999,
        'bundle',
        ARRAY ['full_bundle', 'physics', 'chemistry', 'biology'],
        ARRAY ['All 3 Subjects', 'Live Classes', 'Physical Study Material', 'Personal Mentor', 'Doubt Support'],
        true,
        true,
        '#DC2626'
    ),
    (
        'crash-course',
        'Physics Crash Course',
        'Complete Physics in 60 Days',
        2499,
        'subject',
        ARRAY ['physics'],
        ARRAY ['Complete Physics in 60 Days', 'Formula Sheets', 'Daily Practice Problems', 'Previous Year Questions'],
        true,
        false,
        '#FF5722'
    ),
    (
        'test-series',
        'All India Test Series',
        'Comprehensive Mock Tests for NEET',
        999,
        'test_series',
        ARRAY ['test_series'],
        ARRAY ['50+ Mock Tests', 'AIR Prediction', 'Detailed Analytics', 'Video Solutions'],
        true,
        false,
        '#FFC107'
    ) ON CONFLICT (id) DO
UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    target_ids = EXCLUDED.target_ids,
    features = EXCLUDED.features,
    color = EXCLUDED.color;