-- Add Arabic translation columns to books table
ALTER TABLE books ADD COLUMN title_ar VARCHAR(200);
ALTER TABLE books ADD COLUMN description_ar TEXT;

-- Add Arabic translation column to categories table
ALTER TABLE categories ADD COLUMN name_ar VARCHAR(100);

-- Add Arabic translation columns to authors table
ALTER TABLE authors ADD COLUMN name_ar VARCHAR(100);
ALTER TABLE authors ADD COLUMN bio_ar TEXT;
