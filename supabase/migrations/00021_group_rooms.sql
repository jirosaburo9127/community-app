-- Group chat rooms
CREATE TABLE group_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  creator_id UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_id, name)
);

-- Room messages
CREATE TABLE room_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES group_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_room_messages_room ON room_messages(room_id, created_at ASC);

-- RLS for group_rooms
ALTER TABLE group_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "group_rooms_select" ON group_rooms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_rooms.group_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "group_rooms_insert" ON group_rooms
  FOR INSERT WITH CHECK (
    auth.uid() = creator_id
    AND EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_rooms.group_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "group_rooms_delete" ON group_rooms
  FOR DELETE USING (
    auth.uid() = (SELECT creator_id FROM groups WHERE id = group_rooms.group_id)
  );

-- RLS for room_messages
ALTER TABLE room_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "room_messages_select" ON room_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_rooms
      JOIN group_members ON group_members.group_id = group_rooms.group_id
      WHERE group_rooms.id = room_messages.room_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "room_messages_insert" ON room_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM group_rooms
      JOIN group_members ON group_members.group_id = group_rooms.group_id
      WHERE group_rooms.id = room_messages.room_id
      AND group_members.user_id = auth.uid()
    )
  );

-- Enable realtime for room_messages
ALTER PUBLICATION supabase_realtime ADD TABLE room_messages;
