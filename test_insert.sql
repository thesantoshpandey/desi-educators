-- Try to manually insert a record to see if ID auto-generates
-- We use a dummy UUID for safety (or grab one if possible, but random is fine for testing constraints)
INSERT INTO public.enrollments (user_id, target_id, target_type)
VALUES (
        '00000000-0000-0000-0000-000000000000',
        'test-manual-insert',
        'test'
    )
RETURNING id,
    created_at;