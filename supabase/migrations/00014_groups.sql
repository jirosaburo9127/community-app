-- Groups table
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  avatar_url TEXT,
  creator_id UUID NOT NULL REFERENCES profiles(id),
  startup_id UUID UNIQUE REFERENCES startups(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Group members table
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Add group_id to posts
ALTER TABLE posts ADD COLUMN group_id UUID REFERENCES groups(id) ON DELETE CASCADE;
CREATE INDEX idx_posts_group ON posts(group_id, created_at DESC);

-- Make category_id nullable for group posts
ALTER TABLE posts ALTER COLUMN category_id DROP NOT NULL;

-- RLS for groups
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "groups_select" ON groups
  FOR SELECT USING (true);

CREATE POLICY "groups_insert" ON groups
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "groups_update" ON groups
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "groups_delete" ON groups
  FOR DELETE USING (auth.uid() = creator_id);

-- RLS for group_members
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "group_members_select" ON group_members
  FOR SELECT USING (true);

CREATE POLICY "group_members_insert" ON group_members
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = (SELECT creator_id FROM groups WHERE id = group_id)
  );

CREATE POLICY "group_members_delete" ON group_members
  FOR DELETE USING (
    auth.uid() = user_id
    OR auth.uid() = (SELECT creator_id FROM groups WHERE id = group_id)
  );

-- Update posts RLS: allow group members to see/create group posts
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON posts;
CREATE POLICY "Posts are viewable by everyone" ON posts
  FOR SELECT USING (
    group_id IS NULL
    OR EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = posts.group_id
      AND group_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Authenticated users can create posts" ON posts;
CREATE POLICY "Authenticated users can create posts" ON posts
  FOR INSERT WITH CHECK (
    auth.uid() = author_id
    AND (
      group_id IS NULL
      OR EXISTS (
        SELECT 1 FROM group_members
        WHERE group_members.group_id = posts.group_id
        AND group_members.user_id = auth.uid()
      )
    )
  );
