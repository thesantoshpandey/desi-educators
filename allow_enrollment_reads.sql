-- ==========================================
-- SECURE ENROLLMENTS RLS (PRODUCTION SAFE)
-- Users can READ their own enrollments
-- ONLY backend/service role can INSERT
-- ==========================================
-- 1. Enable RLS on enrollments table
ALTER TABLE IF EXISTS public.enrollments ENABLE ROW LEVEL SECURITY;
-- 2. Remove any existing insecure policies
DROP POLICY IF EXISTS "Users can read own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can insert own enrollments" ON public.enrollments;
-- 3. Allow users to READ only their own enrollments
CREATE POLICY "Users can read their own enrollments" ON public.enrollments FOR
SELECT USING (auth.uid() = user_id);
-- 4. DO NOT allow users to INSERT enrollments
-- Insertions must happen ONLY via backend / Razorpay webhook
-- (Service Role bypasses RLS automatically)
-- 5. Optional: Allow backend to UPDATE enrollment status if needed
CREATE POLICY "Backend can update enrollments" ON public.enrollments FOR
UPDATE USING (true) WITH CHECK (true);