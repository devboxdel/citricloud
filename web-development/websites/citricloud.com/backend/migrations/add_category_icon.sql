-- Add icon field to blog_categories table
-- Run this migration to enable icon selection for categories

ALTER TABLE blog_categories ADD COLUMN icon VARCHAR(100);

-- Set default icon for existing categories
UPDATE blog_categories SET icon = 'pricetag' WHERE icon IS NULL;
