-- ==============================================================================
-- Restore Content Access Script
-- Run this if your Subjects, Chapters, or Topics have "disappeared" (hidden by RLS)
-- ==============================================================================
-- 1. Enable RLS (Security Best Practice)
-- We ensure RLS is on so that we can trust the policies we are about to create.
ALTER TABLE IF EXISTS public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.materials ENABLE ROW LEVEL SECURITY;
-- 2. Create Public Read Policies
-- These policies allow ANYONE (even unauthenticated users) to READ the content structure.
-- This is necessary for the website to display the syllabus.
-- Subjects
DROP POLICY IF EXISTS "Public can view subjects" ON public.subjects;
CREATE POLICY "Public can view subjects" ON public.subjects FOR
SELECT USING (true);
-- Chapters
DROP POLICY IF EXISTS "Public can view chapters" ON public.chapters;
CREATE POLICY "Public can view chapters" ON public.chapters FOR
SELECT USING (true);
-- Topics
DROP POLICY IF EXISTS "Public can view topics" ON public.topics;
CREATE POLICY "Public can view topics" ON public.topics FOR
SELECT USING (true);
-- Materials
DROP POLICY IF EXISTS "Public can view materials" ON public.materials;
CREATE POLICY "Public can view materials" ON public.materials FOR
SELECT USING (true);
-- 3. Verify Data Existence (Optional - Check the "Results" tab after running)
SELECT 'subjects' as table_name,
    count(*) as count
FROM public.subjects
UNION ALL
SELECT 'chapters',
    count(*)
FROM public.chapters
UNION ALL
SELECT 'topics',
    count(*)
FROM public.topics
UNION ALL
SELECT 'materials',
    count(*)
FROM public.materials;