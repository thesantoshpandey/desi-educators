-- =========================================================
-- FINAL FIX SCRIPT (Run this in Supabase SQL Editor)
-- =========================================================
-- This script does 3 things:
-- 1. Fixes the "Secret Permission" so the App can read the DB.
-- 2. Repairs any "Broken" records from previous failed attempts.
-- 3. Manually unlocks "Physics" for you just in case.
-- PART 1: FIX PERMISSIONS (RLS)
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read their own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can read own enrollments" ON public.enrollments;
CREATE POLICY "Users can read their own enrollments" ON public.enrollments FOR
SELECT USING (auth.uid() = user_id);
-- PART 2: REPAIR BROKEN DATA
-- (If target_id is missing but item_id exists, copy it)
UPDATE public.enrollments
SET target_id = item_id
WHERE target_id IS NULL
    AND item_id IS NOT NULL;
-- PART 3: MANUALLY UNLOCK PHYSICS (For your specific email)
-- Replace with your email if different
WITH target_user AS (
    SELECT id
    FROM auth.users
    WHERE email = 'vishal.pandey1912@gmail.com'
    LIMIT 1
)
INSERT INTO public.enrollments (
        user_id,
        target_id,
        item_id,
        course_id,
        item_type,
        access_type
    )
SELECT id,
    'physics',
    'physics',
    'physics',
    'subject',
    'lifetime'
FROM target_user
WHERE NOT EXISTS (
        SELECT 1
        FROM public.enrollments
        WHERE user_id = target_user.id
            AND target_id = 'physics'
    );
-- Check results
SELECT *
FROM public.enrollments
WHERE user_id = (
        SELECT id
        FROM auth.users
        WHERE email = 'vishal.pandey1912@gmail.com'
    );