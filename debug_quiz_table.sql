-- DEBUG: Check Table Schema and Policies for 'quiz_attempts'
-- 1. List all columns to verify names and types
SELECT column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'quiz_attempts';
-- 2. List active RLS policies
SELECT policyname as policy_name,
    cmd as command,
    qual as using_expression,
    with_check as check_expression
FROM pg_policies
WHERE tablename = 'quiz_attempts';