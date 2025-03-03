/*
  # Fix Messages RLS Policies

  1. Changes
    - Drop and recreate all message policies with proper checks
    - Add additional indexes for performance
    - Ensure RLS is enabled
    - Add cascade delete trigger

  2. Security
    - Policies ensure users can only access their own messages
    - Messages are automatically deleted when conversations are deleted
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
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own conversations"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete messages in own conversations"
  ON messages
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- Add indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id
  ON messages(conversation_id);

CREATE INDEX IF NOT EXISTS idx_messages_created_at
  ON messages(created_at DESC);

-- Add cascade delete trigger to clean up messages when conversation is deleted
CREATE OR REPLACE FUNCTION delete_conversation_messages()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM messages WHERE conversation_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_delete_conversation_messages ON conversations;

CREATE TRIGGER trigger_delete_conversation_messages
  BEFORE DELETE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION delete_conversation_messages();