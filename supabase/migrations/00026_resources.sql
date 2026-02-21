-- リソースライブラリ
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('template', 'pitch', 'tech_article', 'tool', 'book', 'other')),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_resources_category ON resources (category);
CREATE INDEX idx_resources_author ON resources (author_id);
CREATE INDEX idx_resources_created ON resources (created_at DESC);

-- RLS
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "resources_select" ON resources FOR SELECT USING (true);
CREATE POLICY "resources_insert" ON resources FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "resources_update" ON resources FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "resources_delete" ON resources FOR DELETE USING (auth.uid() = author_id);

-- updated_at トリガー
CREATE OR REPLACE FUNCTION update_resources_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_resources_updated_at
  BEFORE UPDATE ON resources FOR EACH ROW EXECUTE FUNCTION update_resources_updated_at();

-- バッジトリガー
CREATE TRIGGER badge_on_resource AFTER INSERT ON resources FOR EACH ROW EXECUTE FUNCTION check_and_award_badges();
