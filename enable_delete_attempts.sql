-- Allow users to delete their own quiz attempts
CREATE POLICY "policy_delete_attempts_own" ON public.quiz_attempts FOR DELETE TO authenticated USING (
    user_id = (
        select auth.uid()
    )
);