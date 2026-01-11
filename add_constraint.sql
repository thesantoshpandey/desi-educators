-- Add unique constraint to allow UPSERT operations
ALTER TABLE enrollments
ADD CONSTRAINT enrollments_user_id_target_id_key UNIQUE (user_id, target_id);