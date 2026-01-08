-- ==========================================
-- MANUAL ENROLLMENT SCRIPT
-- Run this to give a user access to content manually
-- ==========================================
-- Replace 'YOUR_USER_EMAIL@EXAMPLE.COM' with the email that paid.
-- (If you are testing, it's likely the one you are logged in with)
WITH target_user AS (
    SELECT id
    FROM auth.users
    WHERE email = 'vishal.pandey1912@gmail.com' -- <--- CHANGE THIS IF NEEDED
    LIMIT 1
)
INSERT INTO public.enrollments (
        user_id,
        target_id,
        item_type,
        access_type,
        created_at
    )
SELECT target_user.id,
    'physics',
    -- 1. Unlock Physics
    'subject',
    'lifetime',
    now()
FROM target_user
WHERE NOT EXISTS (
        SELECT 1
        FROM public.enrollments
        WHERE user_id = target_user.id
            AND target_id = 'physics'
    )
UNION ALL
SELECT target_user.id,
    'test_series',
    -- 2. Unlock Test Series
    'test_series',
    'lifetime',
    now()
FROM target_user
WHERE NOT EXISTS (
        SELECT 1
        FROM public.enrollments
        WHERE user_id = target_user.id
            AND target_id = 'test_series'
    );
-- Note: This unlocks "Physics" and "Test Series". 
-- If you need "Full Bundle", change 'physics' to 'full_bundle'.