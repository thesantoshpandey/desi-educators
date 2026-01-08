-- =========================================================
-- FIX STORAGE PERMISSIONS (Retry without ALTER TABLE)
-- =========================================================
-- 1. Create Bucket (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-materials', 'course-materials', true) ON CONFLICT (id) DO NOTHING;
-- (Skipping ALTER TABLE because it causes permission errors and is likely already on)
-- 2. Public Read Access
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
CREATE POLICY "Public Read Access" ON storage.objects FOR
SELECT USING (bucket_id = 'course-materials');
-- 3. Admin Upload Access
DROP POLICY IF EXISTS "Admin Upload Access" ON storage.objects;
CREATE POLICY "Admin Upload Access" ON storage.objects FOR
INSERT WITH CHECK (
        bucket_id = 'course-materials'
        AND auth.jwt()->>'email' = 'vishal.pandey1912@gmail.com'
    );
-- 4. Admin Update/Delete Access
DROP POLICY IF EXISTS "Admin Delete Access" ON storage.objects;
CREATE POLICY "Admin Delete Access" ON storage.objects FOR DELETE USING (
    bucket_id = 'course-materials'
    AND auth.jwt()->>'email' = 'vishal.pandey1912@gmail.com'
);
DROP POLICY IF EXISTS "Admin Update Access" ON storage.objects;
CREATE POLICY "Admin Update Access" ON storage.objects FOR
UPDATE USING (
        bucket_id = 'course-materials'
        AND auth.jwt()->>'email' = 'vishal.pandey1912@gmail.com'
    );