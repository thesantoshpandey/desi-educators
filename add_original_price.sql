-- Add original_price column if it doesn't exist
ALTER TABLE products
ADD COLUMN IF NOT EXISTS original_price INTEGER;
-- Update the Full Year Bundle to have a higher original price (creating urgency)
-- Using ID 'full-year' as per the code, but checking for it.
UPDATE products
SET original_price = 24999
WHERE id = 'full-year';
-- Update Crash Course
UPDATE products
SET original_price = 4999
WHERE id = 'crash-course';
-- Update Test Series
UPDATE products
SET original_price = 1999
WHERE id = 'test-series';