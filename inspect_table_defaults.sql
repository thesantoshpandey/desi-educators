SELECT table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name IN ('orders', 'enrollments')
ORDER BY table_name,
    column_name;