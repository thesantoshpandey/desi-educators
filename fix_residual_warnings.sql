-- FINAL CLEANUP SCRIPT (Run this to fix remaining warnings)
-- 1. DROP DUPLICATE/INEFFICIENT POLICIES
-- These are 'shadowing' the optimized ones we created, causing the warning to persist.
-- Note the trailing periods or slight name variations found in your list.
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
-- Duplicate of "Users can insert their own profile"
DROP POLICY IF EXISTS "Users can insert own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON public.user_progress;
-- 2. RE-CREATE MISSING OPTIMIZED POLICIES (for those we just dropped w/o replacements)
-- Enrollments Insert
CREATE POLICY "Users can insert own enrollments" ON public.enrollments FOR
INSERT TO authenticated WITH CHECK (
        user_id = (
            select auth.uid()
        )
    );
-- User Progress (Optimized)
CREATE POLICY "Users can view own progress" ON public.user_progress FOR
SELECT TO authenticated USING (
        user_id = (
            select auth.uid()
        )
    );
CREATE POLICY "Users can update own progress" ON public.user_progress FOR
UPDATE TO authenticated USING (
        user_id = (
            select auth.uid()
        )
    );
-- 3. FIX DANGEROUS "PERMISSIVE" POLICIES
-- Issue: You have policies allowing 'public' to do 'ALL' (Delete, Update, Insert) on Content.
-- Fix: Change them to SELECT only for public.
-- Subjects
DROP POLICY IF EXISTS "Public Access Subjects" ON public.subjects;
CREATE POLICY "Public Read Subjects" ON public.subjects FOR
SELECT TO public USING (true);
-- Chapters
DROP POLICY IF EXISTS "Public Access Chapters" ON public.chapters;
CREATE POLICY "Public Read Chapters" ON public.chapters FOR
SELECT TO public USING (true);
-- Topics
DROP POLICY IF EXISTS "Public Access Topics" ON public.topics;
CREATE POLICY "Public Read Topics" ON public.topics FOR
SELECT TO public USING (true);
-- Materials
DROP POLICY IF EXISTS "Public Access Materials" ON public.materials;
CREATE POLICY "Public Read Materials" ON public.materials FOR
SELECT TO public USING (true);
-- Quizzes (Currently "Admins can manage quizzes" allows public access?? Fix strictly)
DROP POLICY IF EXISTS "Admins can manage quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Public read access for quizzes" ON public.quizzes;
CREATE POLICY "Public Read Quizzes" ON public.quizzes FOR
SELECT TO public USING (true);
-- (We will leave Admin Write access for now to be handled by Service Role or a specific Admin Policy usually)
-- Quiz Questions
DROP POLICY IF EXISTS "Public read access for questions" ON public.quiz_questions;
DROP POLICY IF EXISTS "Admins can manage questions" ON public.quiz_questions;
CREATE POLICY "Public Read Questions" ON public.quiz_questions FOR
SELECT TO public USING (true);