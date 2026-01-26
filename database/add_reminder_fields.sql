-- Add reminder fields to diaries table if they don't exist
ALTER TABLE diaries ADD COLUMN IF NOT EXISTS reminder_enabled BOOLEAN DEFAULT false;
ALTER TABLE diaries ADD COLUMN IF NOT EXISTS reminder_date TEXT;
ALTER TABLE diaries ADD COLUMN IF NOT EXISTS reminder_time TEXT;
