-- =========================================================
-- FIX CONTENT PERMISSIONS (ADMIN WRITE ACCESS)
-- =========================================================
-- List of tables to fix
-- 1. subjects
-- 2. chapters
-- 3. topics
-- 4. materials
-- 5. quizzes
-- 6. quiz_questions
-- A. Enable RLS on all (Safety First)
ALTER TABLE IF EXISTS public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.quiz_questions ENABLE ROW LEVEL SECURITY;
-- B. Helper Function to Verify Admin (if not exists)
-- Or we just check the specific email in the policy for simplicity
-- We will use the email check directly in policy for robustness.
-- C. Apply Policies Loop (Manual Unroll)
-- 1. SUBJECTS
DROP POLICY IF EXISTS "Public Read" ON public.subjects;
CREATE POLICY "Public Read" ON public.subjects FOR
SELECT USING (true);
DROP POLICY IF EXISTS "Admin Full Access" ON public.subjects;
CREATE POLICY "Admin Full Access" ON public.subjects FOR ALL USING (
    auth.jwt()->>'email' = 'vishal.pandey1912@gmail.com'
) WITH CHECK (
    auth.jwt()->>'email' = 'vishal.pandey1912@gmail.com'
);
-- 2. CHAPTERS
DROP POLICY IF EXISTS "Public Read" ON public.chapters;
CREATE POLICY "Public Read" ON public.chapters FOR
SELECT USING (true);
DROP POLICY IF EXISTS "Admin Full Access" ON public.chapters;
CREATE POLICY "Admin Full Access" ON public.chapters FOR ALL USING (
    auth.jwt()->>'email' = 'vishal.pandey1912@gmail.com'
) WITH CHECK (
    auth.jwt()->>'email' = 'vishal.pandey1912@gmail.com'
);
-- 3. TOPICS
DROP POLICY IF EXISTS "Public Read" ON public.topics;
CREATE POLICY "Public Read" ON public.topics FOR
SELECT USING (true);
DROP POLICY IF EXISTS "Admin Full Access" ON public.topics;
CREATE POLICY "Admin Full Access" ON public.topics FOR ALL USING (
    auth.jwt()->>'email' = 'vishal.pandey1912@gmail.com'
) WITH CHECK (
    auth.jwt()->>'email' = 'vishal.pandey1912@gmail.com'
);
-- 4. MATERIALS
DROP POLICY IF EXISTS "Public Read" ON public.materials;
CREATE POLICY "Public Read" ON public.materials FOR
SELECT USING (true);
DROP POLICY IF EXISTS "Admin Full Access" ON public.materials;
CREATE POLICY "Admin Full Access" ON public.materials FOR ALL USING (
    auth.jwt()->>'email' = 'vishal.pandey1912@gmail.com'
) WITH CHECK (
    auth.jwt()->>'email' = 'vishal.pandey1912@gmail.com'
);
-- 5. QUIZZES
DROP POLICY IF EXISTS "Public Read" ON public.quizzes;
CREATE POLICY "Public Read" ON public.quizzes FOR
SELECT USING (true);
DROP POLICY IF EXISTS "Admin Full Access" ON public.quizzes;
CREATE POLICY "Admin Full Access" ON public.quizzes FOR ALL USING (
    auth.jwt()->>'email' = 'vishal.pandey1912@gmail.com'
) WITH CHECK (
    auth.jwt()->>'email' = 'vishal.pandey1912@gmail.com'
);
-- 6. QUIZ QUESTIONS
DROP POLICY IF EXISTS "Public Read" ON public.quiz_questions;
CREATE POLICY "Public Read" ON public.quiz_questions FOR
SELECT USING (true);
DROP POLICY IF EXISTS "Admin Full Access" ON public.quiz_questions;
CREATE POLICY "Admin Full Access" ON public.quiz_questions FOR ALL USING (
    auth.jwt()->>'email' = 'vishal.pandey1912@gmail.com'
) WITH CHECK (
    auth.jwt()->>'email' = 'vishal.pandey1912@gmail.com'
);