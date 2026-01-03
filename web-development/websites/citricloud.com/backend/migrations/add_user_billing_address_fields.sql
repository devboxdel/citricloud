-- Add billing address fields to users table
-- Migration: add_user_billing_address_fields
-- Date: 2025-12-27

ALTER TABLE users ADD COLUMN IF NOT EXISTS address VARCHAR(500);
ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS country VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS zip_code VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS province VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS district VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS block VARCHAR(100);

-- Add indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_users_city ON users(city);
CREATE INDEX IF NOT EXISTS idx_users_country ON users(country);

COMMENT ON COLUMN users.address IS 'User street address';
COMMENT ON COLUMN users.city IS 'User city';
COMMENT ON COLUMN users.country IS 'User country';
COMMENT ON COLUMN users.zip_code IS 'User ZIP/Postal code';
COMMENT ON COLUMN users.province IS 'User province/state';
COMMENT ON COLUMN users.district IS 'User district';
COMMENT ON COLUMN users.block IS 'User block/neighborhood';
