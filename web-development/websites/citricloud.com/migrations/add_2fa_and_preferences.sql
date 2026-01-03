-- Add Two-Factor Authentication and User Preferences columns to users table
-- Created: 2025-12-21

-- Add 2FA columns
ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN two_factor_secret VARCHAR(255) DEFAULT NULL;
ALTER TABLE users ADD COLUMN two_factor_backup_codes JSONB DEFAULT NULL;

-- Add preference columns  
ALTER TABLE users ADD COLUMN preferred_language VARCHAR(10) DEFAULT 'en';
ALTER TABLE users ADD COLUMN preferred_date_format VARCHAR(50) DEFAULT 'MM/DD/YYYY';
ALTER TABLE users ADD COLUMN preferred_timezone VARCHAR(50) DEFAULT 'UTC';
