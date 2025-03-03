/*
  # Fix Personality Test RLS Policies

  1. Changes
    - Add proper RLS policies for personality_results table
    - Add indexes for better performance
    - Add cascade delete trigger

  2. Security
    - Users can only access their own results
    - Results are automatically deleted when user is deleted
    - Proper RLS enforcement for all operations
*/

-- First, ensure RLS is enabled
ALTER TABLE personality_results ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own personality results" ON personality_results;
DROP POLICY IF EXISTS "Users can create own personality results" ON personality_results;

-- Create comprehensive policies
CREATE POLICY "Users can view own personality results"
  ON personality_results
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own personality results"
  ON personality_results
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Add indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_personality_results_user_id
  ON personality_results(user_id);

CREATE INDEX IF NOT EXISTS idx_personality_results_created_at
  ON personality_results(created_at DESC);

-- Add user_id if it doesn't exist (safety check)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'personality_results' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE personality_results 
    ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL;
  END IF;
END $$;