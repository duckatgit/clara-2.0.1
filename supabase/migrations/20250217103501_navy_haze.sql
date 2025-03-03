/*
  # Add onboarded column to user_preferences

  1. Changes
    - Add onboarded column to user_preferences table with default value of false
    - Update existing users to have onboarded=true if they have preferences set
  
  2. Security
    - No changes to RLS policies needed
    - Column inherits existing table-level security
*/

-- Add onboarded column to user_preferences
ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS onboarded boolean DEFAULT false;

-- Update existing rows to have onboarded=true if they have preferences set
UPDATE user_preferences
SET onboarded = true
WHERE role IS NOT NULL 
  AND tone IS NOT NULL 
  AND focus_areas IS NOT NULL 
  AND interaction_frequency IS NOT NULL;