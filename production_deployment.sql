-- PRODUCTION DEPLOYMENT SCRIPT
-- Run this in the Supabase SQL Editor to apply all quiz-related fixes.
-- ==========================================
-- 1. SCHEMA FIXES (QUIZ ATTEMPTS)
-- ==========================================
-- Ensure 'quiz_attempts' has all required columns
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now()
);
-- Add Columns safely if they don't exist
DO $$ BEGIN -- quiz_id
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'quiz_attempts'
        AND column_name = 'quiz_id'
) THEN
ALTER TABLE public.quiz_attempts
ADD COLUMN quiz_id uuid REFERENCES public.quizzes(id) ON DELETE CASCADE;
END IF;
-- user_id
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'quiz_attempts'
        AND column_name = 'user_id'
) THEN
ALTER TABLE public.quiz_attempts
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
END IF;
-- score
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'quiz_attempts'
        AND column_name = 'score'
) THEN
ALTER TABLE public.quiz_attempts
ADD COLUMN score numeric DEFAULT 0;
END IF;
-- percentage
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'quiz_attempts'
        AND column_name = 'percentage'
) THEN
ALTER TABLE public.quiz_attempts
ADD COLUMN percentage numeric DEFAULT 0;
END IF;
-- total_marks
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'quiz_attempts'
        AND column_name = 'total_marks'
) THEN
ALTER TABLE public.quiz_attempts
ADD COLUMN total_marks numeric DEFAULT 0;
END IF;
-- correct_count
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'quiz_attempts'
        AND column_name = 'correct_count'
) THEN
ALTER TABLE public.quiz_attempts
ADD COLUMN correct_count numeric DEFAULT 0;
END IF;
-- wrong_count
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'quiz_attempts'
        AND column_name = 'wrong_count'
) THEN
ALTER TABLE public.quiz_attempts
ADD COLUMN wrong_count numeric DEFAULT 0;
END IF;
-- answers (JSONB)
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'quiz_attempts'
        AND column_name = 'answers'
) THEN
ALTER TABLE public.quiz_attempts
ADD COLUMN answers jsonb DEFAULT '{}'::jsonb;
END IF;
-- completed_at
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'quiz_attempts'
        AND column_name = 'completed_at'
) THEN
ALTER TABLE public.quiz_attempts
ADD COLUMN completed_at timestamp with time zone DEFAULT now();
END IF;
END $$;
-- ==========================================
-- 2. RLS POLICIES (DASHBOARD & QUIZZES)
-- ==========================================
-- Enable RLS
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
-- QUIZZES (Public Read Access)
-- Check if policy exists before creating to avoid errors
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'quizzes'
        AND policyname = 'policy_view_quizzes_public'
) THEN CREATE POLICY "policy_view_quizzes_public" ON public.quizzes FOR
SELECT USING (true);
END IF;
END $$;
-- QUIZ ATTEMPTS (User View Own)
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'quiz_attempts'
        AND policyname = 'policy_view_attempts_own'
) THEN CREATE POLICY "policy_view_attempts_own" ON public.quiz_attempts FOR
SELECT TO authenticated USING (
        user_id = (
            select auth.uid()
        )
    );
END IF;
END $$;
-- QUIZ ATTEMPTS (User Insert Own)
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'quiz_attempts'
        AND policyname = 'policy_insert_attempts_own'
) THEN CREATE POLICY "policy_insert_attempts_own" ON public.quiz_attempts FOR
INSERT TO authenticated WITH CHECK (
        user_id = (
            select auth.uid()
        )
    );
END IF;
END $$;