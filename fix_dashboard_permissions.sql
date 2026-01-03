-- FIX: Enable Read Access for Dashboard
-- Issue: Dashboard fails to join 'quiz_attempts' with 'quizzes' likely due to RLS.
-- 1. QUIZZES Table: Allow Public Read (Catalog data)
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "policy_view_quizzes_public" ON public.quizzes;
CREATE POLICY "policy_view_quizzes_public" ON public.quizzes FOR
SELECT USING (true);
-- Anyone can see quiz titles
-- 2. QUIZ_ATTEMPTS Table: Ensure User Read Access
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "policy_view_own_attempts" ON public.quiz_attempts;
CREATE POLICY "policy_view_own_attempts" ON public.quiz_attempts FOR
SELECT TO authenticated USING (
        user_id = (
            select auth.uid()
        )
        OR user_id IN (
            select id
            from public.profiles
            where id = auth.uid()
        ) -- In case user_id links to profiles
    );