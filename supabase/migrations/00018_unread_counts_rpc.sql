-- RPC function to get unread message count in a single query
CREATE OR REPLACE FUNCTION get_unread_message_count()
RETURNS INTEGER AS $$
  SELECT COALESCE(COUNT(*)::int, 0)
  FROM direct_messages dm
  JOIN conversations c ON c.id = dm.conversation_id
  WHERE dm.is_read = false
    AND dm.sender_id != auth.uid()
    AND (c.participant1 = auth.uid() OR c.participant2 = auth.uid());
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- RPC function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count()
RETURNS INTEGER AS $$
  SELECT COALESCE(COUNT(*)::int, 0)
  FROM notifications
  WHERE user_id = auth.uid()
    AND is_read = false;
$$ LANGUAGE sql SECURITY DEFINER STABLE;
