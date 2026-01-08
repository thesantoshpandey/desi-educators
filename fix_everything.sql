-- =========================================================
-- FINAL FIX SCRIPT (VERIFIED SCHEMA)
-- =========================================================
-- 1. FIX PERMISSIONS (RLS)
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read their own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can read own enrollments" ON public.enrollments;
CREATE POLICY "Users can read their own enrollments" ON public.enrollments FOR
SELECT USING (auth.uid() = user_id);
-- 2. MANUALLY UNLOCK PHYSICS (Using ONLY valid columns: user_id, target_id, target_type)
WITH target_user AS (
    SELECT id
    FROM auth.users
    WHERE email = 'vishal.pandey1912@gmail.com'
    LIMIT 1
)
INSERT INTO public.enrollments (user_id, target_id, target_type)
SELECT id,
    'physics',
    'subject'
FROM target_user
WHERE NOT EXISTS (
        SELECT 1
        FROM public.enrollments
        WHERE user_id = target_user.id
            AND target_id = 'physics'
    );
-- 3. VERIFY
SELECT *
FROM public.enrollments
WHERE user_id = (
        SELECT id
        FROM auth.users
        WHERE email = 'vishal.pandey1912@gmail.com'
    );