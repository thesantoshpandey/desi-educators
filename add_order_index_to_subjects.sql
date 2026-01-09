ALTER TABLE subjects
ADD COLUMN IF NOT EXISTS order_index SERIAL;
-- Note: SERIAL might not be best for existing data, but we can just use INTEGER and update it.
-- Better:
ALTER TABLE subjects
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;