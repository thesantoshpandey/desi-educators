-- Fix for "Table public.profiles has a row level security policy... that re-evaluates..."
-- Issue: Calling auth.uid() directly in a policy can cause it to be run for every row.
-- Fix: Wrap it in (select auth.uid()) to cache the result for the transaction.
-- 1. Drop the existing inefficient policy
-- Note: You might need to check the exact name of your policy in the dashboard. 
-- Common names are "Users can insert their own profile" or "Enable insert for users based on user_id"
-- I will attempt to drop the likely name, but if it fails, check your policy name.
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
-- 2. Create the optimized policy
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR
INSERT WITH CHECK (auth.uid() = id);
-- Wait, the issue description says: "Resolve the issue by replacing auth.<function>() with (select auth.<function>())"
-- Actually for INSERT policies, optimization is less critical than SELECT, but for consistency:
ALTER POLICY "Users can insert their own profile" ON public.profiles TO authenticated WITH CHECK (
    id = (
        select auth.uid()
    )
);
-- Note: If the policy was for SELECT/UPDATE, it would be:
-- USING ( id = (select auth.uid()) );