-- Policy to allow users to insert their own enrollments
-- This is necessary because the frontend currently handles enrollment creation after payment success.
-- Security Note: Ideally, this should be done via a secure webhook or Edge Function to prevent self-enrollment without payment.
-- However, given the current architecture request, we enable this policy.
CREATE POLICY "Enable insert for users based on user_id" ON "public"."enrollments" FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable update for users based on user_id" ON "public"."enrollments" FOR
UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);