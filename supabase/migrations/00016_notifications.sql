-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,  -- 'comment' | 'reaction'
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE SET NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- Prevent duplicate notifications for the same action
CREATE UNIQUE INDEX idx_notifications_unique
  ON notifications(user_id, actor_id, type, post_id, COALESCE(comment_id, '00000000-0000-0000-0000-000000000000'));

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select" ON notifications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "notifications_update" ON notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "notifications_delete" ON notifications
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Allow system (triggers) to insert notifications
CREATE POLICY "notifications_insert" ON notifications
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- ============================================================
-- TRIGGER: Create notification on new comment
-- ============================================================
CREATE OR REPLACE FUNCTION notify_on_comment()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id UUID;
BEGIN
  -- Get the post author
  SELECT author_id INTO post_author_id FROM posts WHERE id = NEW.post_id;

  -- Don't notify yourself
  IF post_author_id IS NOT NULL AND post_author_id != NEW.author_id THEN
    INSERT INTO notifications (user_id, actor_id, type, post_id, comment_id)
    VALUES (post_author_id, NEW.author_id, 'comment', NEW.post_id, NEW.id)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_comment_created
  AFTER INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION notify_on_comment();

-- ============================================================
-- TRIGGER: Create notification on new reaction
-- ============================================================
CREATE OR REPLACE FUNCTION notify_on_reaction()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id UUID;
BEGIN
  -- Get the post author
  SELECT author_id INTO post_author_id FROM posts WHERE id = NEW.post_id;

  -- Don't notify yourself
  IF post_author_id IS NOT NULL AND post_author_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, actor_id, type, post_id)
    VALUES (post_author_id, NEW.user_id, 'reaction', NEW.post_id)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_reaction_created
  AFTER INSERT ON reactions
  FOR EACH ROW EXECUTE FUNCTION notify_on_reaction();
