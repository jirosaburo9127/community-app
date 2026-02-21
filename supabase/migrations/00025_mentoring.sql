-- メンタープロフィール
CREATE TABLE mentor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  expertise_areas TEXT[] DEFAULT '{}',
  bio TEXT NOT NULL DEFAULT '',
  max_mentees INT NOT NULL DEFAULT 3,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- メンタリングリクエスト
CREATE TABLE mentoring_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES mentor_profiles(id) ON DELETE CASCADE,
  mentee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(mentor_id, mentee_id)
);

CREATE INDEX idx_mentor_profiles_user ON mentor_profiles (user_id);
CREATE INDEX idx_mentor_profiles_available ON mentor_profiles (is_available);
CREATE INDEX idx_mentoring_requests_mentor ON mentoring_requests (mentor_id);
CREATE INDEX idx_mentoring_requests_mentee ON mentoring_requests (mentee_id);
CREATE INDEX idx_mentoring_requests_status ON mentoring_requests (status);

-- RLS
ALTER TABLE mentor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentoring_requests ENABLE ROW LEVEL SECURITY;

-- メンタープロフィール: 全員閲覧可
CREATE POLICY "mentor_profiles_select" ON mentor_profiles FOR SELECT USING (true);
CREATE POLICY "mentor_profiles_insert" ON mentor_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "mentor_profiles_update" ON mentor_profiles FOR UPDATE USING (auth.uid() = user_id);

-- メンタリングリクエスト: 関係者のみ閲覧
CREATE POLICY "mentoring_requests_select" ON mentoring_requests
  FOR SELECT USING (
    mentee_id = auth.uid() OR
    mentor_id IN (SELECT id FROM mentor_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "mentoring_requests_insert" ON mentoring_requests
  FOR INSERT WITH CHECK (mentee_id = auth.uid());

CREATE POLICY "mentoring_requests_update" ON mentoring_requests
  FOR UPDATE USING (
    mentor_id IN (SELECT id FROM mentor_profiles WHERE user_id = auth.uid())
  );

-- updated_at トリガー
CREATE OR REPLACE FUNCTION update_mentor_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_mentor_profiles_updated_at
  BEFORE UPDATE ON mentor_profiles FOR EACH ROW EXECUTE FUNCTION update_mentor_profiles_updated_at();

CREATE OR REPLACE FUNCTION update_mentoring_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_mentoring_requests_updated_at
  BEFORE UPDATE ON mentoring_requests FOR EACH ROW EXECUTE FUNCTION update_mentoring_requests_updated_at();

-- バッジトリガー
CREATE TRIGGER badge_on_mentor AFTER INSERT ON mentor_profiles FOR EACH ROW EXECUTE FUNCTION check_and_award_badges();
