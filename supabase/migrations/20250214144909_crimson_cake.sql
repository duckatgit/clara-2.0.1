/*
  # Add reminder preferences column

  1. Changes
    - Add reminder_preferences column to user_preferences table
    - Column type is JSONB to store structured reminder settings
    - Set default value with standard reminder preferences

  2. Security
    - No additional security needed as table already has RLS enabled
*/

-- Add reminder_preferences column with default values
ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS reminder_preferences JSONB DEFAULT jsonb_build_object(
  'enabled', true,
  'frequency', 'medium',
  'quiet_hours', jsonb_build_object(
    'start', 22,
    'end', 8
  ),
  'channels', jsonb_build_object(
    'chat', true,
    'email', false,
    'push', false
  ),
  'types', jsonb_build_object(
    'deadline', true,
    'progress', true,
    'milestone', true,
    'suggestion', false
  )
);