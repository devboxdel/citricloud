-- Add SMS Notifications and Order Updates columns to notification_settings table
-- Created: 2025-12-21

ALTER TABLE notification_settings ADD COLUMN sms_notifications BOOLEAN DEFAULT FALSE;
ALTER TABLE notification_settings ADD COLUMN order_updates BOOLEAN DEFAULT TRUE;
