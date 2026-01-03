-- Add user preference fields to users table
-- Migration: add_user_preferences_fields
-- Date: 2025-12-27

-- Appearance & Theme Preferences
ALTER TABLE users ADD COLUMN IF NOT EXISTS theme_mode VARCHAR(20) DEFAULT 'auto';
ALTER TABLE users ADD COLUMN IF NOT EXISTS theme_auto_source VARCHAR(20) DEFAULT 'system';
ALTER TABLE users ADD COLUMN IF NOT EXISTS primary_color VARCHAR(10) DEFAULT '#0ea5e9';

-- Notification Preferences
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS push_notifications BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS marketing_emails BOOLEAN DEFAULT FALSE;

-- Privacy Preferences
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_visibility VARCHAR(20) DEFAULT 'public';
ALTER TABLE users ADD COLUMN IF NOT EXISTS activity_visibility VARCHAR(20) DEFAULT 'connections';
ALTER TABLE users ADD COLUMN IF NOT EXISTS data_sharing BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS analytics_enabled BOOLEAN DEFAULT TRUE;

-- Security Preferences
ALTER TABLE users ADD COLUMN IF NOT EXISTS recovery_email VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS recovery_phone VARCHAR(50);

-- Accessibility Preferences
ALTER TABLE users ADD COLUMN IF NOT EXISTS font_size VARCHAR(20) DEFAULT 'medium';
ALTER TABLE users ADD COLUMN IF NOT EXISTS high_contrast BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reduce_motion BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS screen_reader BOOLEAN DEFAULT FALSE;

-- Update existing users to have default sky primary color
UPDATE users SET primary_color = '#0ea5e9' WHERE primary_color IS NULL OR primary_color = '#8b5cf6' OR primary_color = '#3b82f6';
