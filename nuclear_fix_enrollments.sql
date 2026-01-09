-- =========================================================
-- NUCLEAR FIX FOR ENROLLMENTS ID 
-- (Drop Identity -> Switch to Sequence)
-- =========================================================
-- 1. Remove the "Identity" property (if it exists)
-- This clears the "Identity column" error
ALTER TABLE public.enrollments
ALTER COLUMN id DROP IDENTITY IF EXISTS;
-- 2. Bind the Sequence (that we created)
-- Ensure the sequence exists
CREATE SEQUENCE IF NOT EXISTS enrollments_id_seq;
-- Bind it
ALTER TABLE public.enrollments
ALTER COLUMN id
SET DEFAULT nextval('enrollments_id_seq');
-- 3. Sync it
SELECT setval(
        'enrollments_id_seq',
        COALESCE(
            (
                SELECT MAX(id)
                FROM public.enrollments
            ),
            1
        )
    );
-- =========================================================
-- FORCE FIX ORDERS (Still needed)
-- =========================================================
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;