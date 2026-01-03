-- FIX: Ensure 'quiz_attempts' has all required columns
-- This script safely adds columns if they are missing.
-- 1. Ensure Table Exists (it should, but just in case)
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp field(timestamptz) DEFAULT now()
);
-- 2. Add Columns safely
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
-- answers (JSONB for storing the full answer sheet)
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