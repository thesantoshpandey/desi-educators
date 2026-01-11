-- ENSURE PUBLIC VISIBILITY OF CONTENT METADATA (The Catalogue)
-- We want everyone to SEE the list of subjects, chapters, and materials (so they can buy them).
-- We DO NOT want them to download the files (handled by Storage RLS).
-- 1. Subjects
DROP POLICY IF EXISTS "Public can view subjects" ON subjects;
CREATE POLICY "Public can view subjects" ON subjects FOR
SELECT USING (true);
-- 2. Chapters
DROP POLICY IF EXISTS "Public can view chapters" ON chapters;
CREATE POLICY "Public can view chapters" ON chapters FOR
SELECT USING (true);
-- 3. Topics
DROP POLICY IF EXISTS "Public can view topics" ON topics;
CREATE POLICY "Public can view topics" ON topics FOR
SELECT USING (true);
-- 4. Materials (The Metadata, like Title/Price, NOT the file content)
DROP POLICY IF EXISTS "Public can view materials metadata" ON materials;
CREATE POLICY "Public can view materials metadata" ON materials FOR
SELECT USING (true);
-- 5. Quizzes (Metadata)
DROP POLICY IF EXISTS "Public can view quizzes metadata" ON quizzes;
CREATE POLICY "Public can view quizzes metadata" ON quizzes FOR
SELECT USING (true);
-- 6. Products (Pricing Plans)
DROP POLICY IF EXISTS "Public can view products" ON products;
CREATE POLICY "Public can view products" ON products FOR
SELECT USING (true);
-- 7. Enrollments (Strictly Private)
DROP POLICY IF EXISTS "Users can view own enrollments" ON enrollments;
CREATE POLICY "Users can view own enrollments" ON enrollments FOR
SELECT USING (auth.uid() = user_id);
-- Note:
-- This setup ensures your "Storefront" works: users see locked items with lock icons.
-- The Actual PDF Security is handled by your Private 'secure-materials' Storage Bucket + API.