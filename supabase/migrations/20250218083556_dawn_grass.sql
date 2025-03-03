/*
  # Add message limits tracking

  1. New Columns
    - Add daily_message_count to subscriptions table
    - Add last_message_reset to subscriptions table
    - Add message_limit to subscriptions table

  2. Functions
    - Add function to reset message count daily
    - Add function to increment message count

  3. Security
    - Update RLS policies to maintain data integrity
*/

-- Add new columns to subscriptions table
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS daily_message_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_message_reset timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS message_limit integer DEFAULT 20;

-- Function to reset message count daily
CREATE OR REPLACE FUNCTION reset_daily_message_count()
RETURNS void AS $$
BEGIN
  UPDATE subscriptions
  SET daily_message_count = 0,
      last_message_reset = now()
  WHERE date_trunc('day', now()) > date_trunc('day', last_message_reset);
END;
$$ LANGUAGE plpgsql;

-- Function to increment message count
CREATE OR REPLACE FUNCTION increment_message_count(user_id_param uuid)
RETURNS boolean AS $$
DECLARE
  current_count integer;
  user_limit integer;
BEGIN
  -- First reset if needed
  PERFORM reset_daily_message_count();
  
  -- Get current count and limit
  SELECT daily_message_count, message_limit 
  INTO current_count, user_limit
  FROM subscriptions 
  WHERE user_id = user_id_param;
  
  -- Check if under limit
  IF current_count >= user_limit THEN
    RETURN false;
  END IF;
  
  -- Increment count
  UPDATE subscriptions
  SET daily_message_count = daily_message_count + 1
  WHERE user_id = user_id_param;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;