-- Drop the permissive policy
DROP POLICY IF EXISTS "Backend can update enrollments" ON public.enrollments;
-- Re-create it restricted to the service_role only (if needed)
-- Note: Examples often imply service_role bypasses RLS, but explicit policies TO service_role are safe.
CREATE POLICY "Backend can update enrollments" ON public.enrollments FOR
UPDATE TO service_role USING (true) WITH CHECK (true);