-- Policy to allow users to view their own enrollments
CREATE POLICY "Enable select for users based on user_id" ON "public"."enrollments" FOR
SELECT USING (auth.uid() = user_id);