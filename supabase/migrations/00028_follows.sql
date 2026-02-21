-- フォロー機能
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT follows_no_self CHECK (follower_id != following_id)
);

CREATE UNIQUE INDEX idx_follows_unique ON follows(follower_id, following_id);
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);

-- RLS
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "follows_select" ON follows FOR SELECT USING (true);
CREATE POLICY "follows_insert" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "follows_delete" ON follows FOR DELETE USING (auth.uid() = follower_id);

-- フォロー通知トリガー
CREATE OR REPLACE FUNCTION notify_on_follow()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, actor_id, type)
  VALUES (NEW.following_id, NEW.follower_id, 'follow')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_follow_created
  AFTER INSERT ON follows
  FOR EACH ROW EXECUTE FUNCTION notify_on_follow();

-- シードデータ（既存ユーザー間でサンプルフォロー）
DO $$
DECLARE
  user_ids UUID[];
  i INT;
  j INT;
BEGIN
  SELECT ARRAY(SELECT id FROM profiles ORDER BY created_at LIMIT 6) INTO user_ids;
  IF array_length(user_ids, 1) >= 3 THEN
    -- 最初の3ユーザーが相互フォロー
    FOR i IN 1..3 LOOP
      FOR j IN 1..3 LOOP
        IF i != j THEN
          INSERT INTO follows (follower_id, following_id)
          VALUES (user_ids[i], user_ids[j])
          ON CONFLICT DO NOTHING;
        END IF;
      END LOOP;
    END LOOP;
  END IF;
END $$;
