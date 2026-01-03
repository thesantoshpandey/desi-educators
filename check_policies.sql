-- Run this to see EXACTLY what policies exist in your database.
-- This helps us verify if the old inefficient policies were actually deleted or not.
SELECT schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public';