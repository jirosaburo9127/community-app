-- バッジ定義テーブル
CREATE TABLE badge_definitions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  icon_emoji TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0
);

-- ユーザー獲得バッジ
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL REFERENCES badge_definitions(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user ON user_badges (user_id);

-- RLS
ALTER TABLE badge_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "badge_definitions_select" ON badge_definitions FOR SELECT USING (true);
CREATE POLICY "user_badges_select" ON user_badges FOR SELECT USING (true);

-- 14バッジ定義
INSERT INTO badge_definitions (id, name, description, icon_emoji, sort_order) VALUES
  ('first_post',       '初投稿',           '初めての投稿を作成',           '&#x1F4DD;', 1),
  ('first_comment',    '初コメント',        '初めてのコメント',             '&#x1F4AC;', 2),
  ('first_reaction',   '初リアクション',     '初めてリアクションを受けた',     '&#x2764;&#xFE0F;', 3),
  ('post_10',          '投稿マスター',       '投稿10件達成',               '&#x1F3AF;', 4),
  ('comment_10',       'コメントマスター',    'コメント10件達成',            '&#x1F5E3;&#xFE0F;', 5),
  ('points_100',       '100ポイント',        '100ポイント達成',             '&#x1F4AF;', 6),
  ('points_500',       '500ポイント',        '500ポイント達成',             '&#x1F525;', 7),
  ('startup_creator',  'スタートアップ創設',  'スタートアップを登録',          '&#x1F680;', 8),
  ('event_organizer',  'イベント主催者',      'イベントを作成',              '&#x1F389;', 9),
  ('event_5',          'イベント常連',        'イベント5回参加',             '&#x1F3C3;', 10),
  ('course_completed', '学習完了',           'コースを1つ完了',             '&#x1F393;', 11),
  ('group_creator',    'グループ作成者',      'グループを作成',              '&#x1F465;', 12),
  ('mentor_registered','メンター登録',        'メンターとして登録',           '&#x1F9D1;&#x200D;&#x1F3EB;', 13),
  ('resource_shared',  'ナレッジ共有者',      'リソースを共有',              '&#x1F4DA;', 14);

-- バッジ自動付与関数
CREATE OR REPLACE FUNCTION check_and_award_badges()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_count INT;
  v_points INT;
BEGIN
  -- 対象ユーザーの特定
  IF TG_TABLE_NAME = 'posts' THEN
    v_user_id := NEW.author_id;
  ELSIF TG_TABLE_NAME = 'comments' THEN
    v_user_id := NEW.author_id;
  ELSIF TG_TABLE_NAME = 'reactions' THEN
    -- リアクション受信者 = 投稿者
    SELECT author_id INTO v_user_id FROM posts WHERE id = NEW.post_id;
  ELSIF TG_TABLE_NAME = 'profiles' THEN
    v_user_id := NEW.id;
  ELSIF TG_TABLE_NAME = 'startups' THEN
    v_user_id := NEW.creator_id;
  ELSIF TG_TABLE_NAME = 'events' THEN
    v_user_id := NEW.organizer_id;
  ELSIF TG_TABLE_NAME = 'event_registrations' THEN
    v_user_id := NEW.user_id;
  ELSIF TG_TABLE_NAME = 'course_enrollments' THEN
    v_user_id := NEW.user_id;
  ELSIF TG_TABLE_NAME = 'groups' THEN
    v_user_id := NEW.creator_id;
  ELSIF TG_TABLE_NAME = 'mentor_profiles' THEN
    v_user_id := NEW.user_id;
  ELSIF TG_TABLE_NAME = 'resources' THEN
    v_user_id := NEW.author_id;
  ELSE
    RETURN NEW;
  END IF;

  IF v_user_id IS NULL THEN RETURN NEW; END IF;

  -- first_post
  IF TG_TABLE_NAME = 'posts' THEN
    INSERT INTO user_badges (user_id, badge_id) VALUES (v_user_id, 'first_post') ON CONFLICT DO NOTHING;
    SELECT count(*) INTO v_count FROM posts WHERE author_id = v_user_id;
    IF v_count >= 10 THEN
      INSERT INTO user_badges (user_id, badge_id) VALUES (v_user_id, 'post_10') ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  -- first_comment / comment_10
  IF TG_TABLE_NAME = 'comments' THEN
    INSERT INTO user_badges (user_id, badge_id) VALUES (v_user_id, 'first_comment') ON CONFLICT DO NOTHING;
    SELECT count(*) INTO v_count FROM comments WHERE author_id = v_user_id;
    IF v_count >= 10 THEN
      INSERT INTO user_badges (user_id, badge_id) VALUES (v_user_id, 'comment_10') ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  -- first_reaction
  IF TG_TABLE_NAME = 'reactions' THEN
    INSERT INTO user_badges (user_id, badge_id) VALUES (v_user_id, 'first_reaction') ON CONFLICT DO NOTHING;
  END IF;

  -- points badges (to_jsonb to avoid field resolution error on non-profiles tables)
  IF TG_TABLE_NAME = 'profiles' THEN
    v_points := COALESCE((to_jsonb(NEW)->>'total_points')::int, 0);
    IF v_points >= 100 THEN
      INSERT INTO user_badges (user_id, badge_id) VALUES (v_user_id, 'points_100') ON CONFLICT DO NOTHING;
    END IF;
    IF v_points >= 500 THEN
      INSERT INTO user_badges (user_id, badge_id) VALUES (v_user_id, 'points_500') ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  -- startup_creator
  IF TG_TABLE_NAME = 'startups' THEN
    INSERT INTO user_badges (user_id, badge_id) VALUES (v_user_id, 'startup_creator') ON CONFLICT DO NOTHING;
  END IF;

  -- event_organizer
  IF TG_TABLE_NAME = 'events' THEN
    INSERT INTO user_badges (user_id, badge_id) VALUES (v_user_id, 'event_organizer') ON CONFLICT DO NOTHING;
  END IF;

  -- event_5
  IF TG_TABLE_NAME = 'event_registrations' THEN
    SELECT count(*) INTO v_count FROM event_registrations WHERE user_id = v_user_id AND status = 'registered';
    IF v_count >= 5 THEN
      INSERT INTO user_badges (user_id, badge_id) VALUES (v_user_id, 'event_5') ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  -- course_completed
  IF TG_TABLE_NAME = 'course_enrollments' THEN
    IF (to_jsonb(NEW)->>'completed_at') IS NOT NULL THEN
      INSERT INTO user_badges (user_id, badge_id) VALUES (v_user_id, 'course_completed') ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  -- group_creator
  IF TG_TABLE_NAME = 'groups' THEN
    INSERT INTO user_badges (user_id, badge_id) VALUES (v_user_id, 'group_creator') ON CONFLICT DO NOTHING;
  END IF;

  -- mentor_registered
  IF TG_TABLE_NAME = 'mentor_profiles' THEN
    INSERT INTO user_badges (user_id, badge_id) VALUES (v_user_id, 'mentor_registered') ON CONFLICT DO NOTHING;
  END IF;

  -- resource_shared
  IF TG_TABLE_NAME = 'resources' THEN
    INSERT INTO user_badges (user_id, badge_id) VALUES (v_user_id, 'resource_shared') ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガー設定
CREATE TRIGGER badge_on_post     AFTER INSERT ON posts              FOR EACH ROW EXECUTE FUNCTION check_and_award_badges();
CREATE TRIGGER badge_on_comment  AFTER INSERT ON comments           FOR EACH ROW EXECUTE FUNCTION check_and_award_badges();
CREATE TRIGGER badge_on_reaction AFTER INSERT ON reactions          FOR EACH ROW EXECUTE FUNCTION check_and_award_badges();
CREATE TRIGGER badge_on_profile  AFTER UPDATE ON profiles           FOR EACH ROW EXECUTE FUNCTION check_and_award_badges();
CREATE TRIGGER badge_on_startup  AFTER INSERT ON startups           FOR EACH ROW EXECUTE FUNCTION check_and_award_badges();
CREATE TRIGGER badge_on_event    AFTER INSERT ON events             FOR EACH ROW EXECUTE FUNCTION check_and_award_badges();
CREATE TRIGGER badge_on_event_reg AFTER INSERT ON event_registrations FOR EACH ROW EXECUTE FUNCTION check_and_award_badges();
CREATE TRIGGER badge_on_enrollment AFTER UPDATE ON course_enrollments FOR EACH ROW EXECUTE FUNCTION check_and_award_badges();
CREATE TRIGGER badge_on_group    AFTER INSERT ON groups             FOR EACH ROW EXECUTE FUNCTION check_and_award_badges();

-- 既存データのバックフィル
-- first_post + post_10
INSERT INTO user_badges (user_id, badge_id)
SELECT DISTINCT author_id, 'first_post' FROM posts
ON CONFLICT DO NOTHING;

INSERT INTO user_badges (user_id, badge_id)
SELECT author_id, 'post_10' FROM posts GROUP BY author_id HAVING count(*) >= 10
ON CONFLICT DO NOTHING;

-- first_comment + comment_10
INSERT INTO user_badges (user_id, badge_id)
SELECT DISTINCT author_id, 'first_comment' FROM comments
ON CONFLICT DO NOTHING;

INSERT INTO user_badges (user_id, badge_id)
SELECT author_id, 'comment_10' FROM comments GROUP BY author_id HAVING count(*) >= 10
ON CONFLICT DO NOTHING;

-- first_reaction
INSERT INTO user_badges (user_id, badge_id)
SELECT DISTINCT p.author_id, 'first_reaction' FROM reactions r JOIN posts p ON p.id = r.post_id
ON CONFLICT DO NOTHING;

-- points badges
INSERT INTO user_badges (user_id, badge_id)
SELECT id, 'points_100' FROM profiles WHERE total_points >= 100
ON CONFLICT DO NOTHING;

INSERT INTO user_badges (user_id, badge_id)
SELECT id, 'points_500' FROM profiles WHERE total_points >= 500
ON CONFLICT DO NOTHING;

-- startup_creator
INSERT INTO user_badges (user_id, badge_id)
SELECT DISTINCT creator_id, 'startup_creator' FROM startups
ON CONFLICT DO NOTHING;

-- event_organizer
INSERT INTO user_badges (user_id, badge_id)
SELECT DISTINCT organizer_id, 'event_organizer' FROM events
ON CONFLICT DO NOTHING;

-- event_5
INSERT INTO user_badges (user_id, badge_id)
SELECT user_id, 'event_5' FROM event_registrations WHERE status = 'registered' GROUP BY user_id HAVING count(*) >= 5
ON CONFLICT DO NOTHING;

-- course_completed
INSERT INTO user_badges (user_id, badge_id)
SELECT DISTINCT user_id, 'course_completed' FROM course_enrollments WHERE completed_at IS NOT NULL
ON CONFLICT DO NOTHING;

-- group_creator
INSERT INTO user_badges (user_id, badge_id)
SELECT DISTINCT creator_id, 'group_creator' FROM groups
ON CONFLICT DO NOTHING;
