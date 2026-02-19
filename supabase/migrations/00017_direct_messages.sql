-- Conversations table (1-on-1 DMs)
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant1 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  participant2 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(participant1, participant2),
  CHECK (participant1 < participant2)
);

CREATE INDEX idx_conversations_p1 ON conversations(participant1, last_message_at DESC);
CREATE INDEX idx_conversations_p2 ON conversations(participant2, last_message_at DESC);

-- RLS for conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conversations_select" ON conversations
  FOR SELECT TO authenticated
  USING (auth.uid() = participant1 OR auth.uid() = participant2);

CREATE POLICY "conversations_insert" ON conversations
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = participant1 OR auth.uid() = participant2);

-- Direct messages table
CREATE TABLE direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_dm_conversation ON direct_messages(conversation_id, created_at ASC);
CREATE INDEX idx_dm_unread ON direct_messages(conversation_id, is_read) WHERE is_read = false;

-- RLS for direct_messages
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dm_select" ON direct_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
      AND (c.participant1 = auth.uid() OR c.participant2 = auth.uid())
    )
  );

CREATE POLICY "dm_insert" ON direct_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
      AND (c.participant1 = auth.uid() OR c.participant2 = auth.uid())
    )
  );

CREATE POLICY "dm_update" ON direct_messages
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
      AND (c.participant1 = auth.uid() OR c.participant2 = auth.uid())
    )
  );

-- TRIGGER: Update conversation.last_message_at on new message
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_dm_created
  AFTER INSERT ON direct_messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- Enable Realtime for direct_messages
ALTER PUBLICATION supabase_realtime ADD TABLE direct_messages;
