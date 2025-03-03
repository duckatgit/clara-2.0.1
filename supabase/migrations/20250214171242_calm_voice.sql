/*
  # Fix Messages RLS Policies

  1. Changes
    - Drop and recreate messages table with proper constraints
    - Set up proper RLS policies for messages
    - Ensure proper user isolation

  2. Security
    - Enable RLS on messages table
    - Add policies for viewing, creating, and deleting messages
    - Ensure users can only access messages in their own conversations
*/

-- First, ensure RLS is enabled
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Users can view messages in own conversations" ON messages;
DROP POLICY IF EXISTS "Users can create messages in own conversations" ON messages;
DROP POLICY IF EXISTS "Users can delete messages in own conversations" ON messages;

-- Create comprehensive policies
CREATE POLICY "Users can view messages in own conversations"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    conversation_id IN (
      SELECT id FROM conversations
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own conversations"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM conversations
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete messages in own conversations"
  ON messages
  FOR DELETE
  TO authenticated
  USING (
    conversation_id IN (
      SELECT id FROM conversations
      WHERE user_id = auth.uid()
    )
  );

-- Add index to improve query performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id
  ON messages(conversation_id);