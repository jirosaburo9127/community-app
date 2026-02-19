-- ============================================================
-- STARTUPS
-- ============================================================
CREATE TABLE public.startups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  logo_url    TEXT,
  description TEXT NOT NULL DEFAULT '',
  stage       TEXT NOT NULL DEFAULT 'idea'
              CHECK (stage IN ('idea', 'mvp', 'seed', 'series_a')),
  industry    TEXT NOT NULL DEFAULT '',
  website_url TEXT DEFAULT '',
  creator_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_startups_creator ON public.startups(creator_id);
CREATE INDEX idx_startups_stage ON public.startups(stage);

ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Startups are viewable by everyone"
  ON public.startups FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create startups"
  ON public.startups FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update own startups"
  ON public.startups FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Creators can delete own startups"
  ON public.startups FOR DELETE USING (auth.uid() = creator_id);

-- ============================================================
-- STARTUP MEMBERS
-- ============================================================
CREATE TABLE public.startup_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id  UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'member',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (startup_id, user_id)
);

CREATE INDEX idx_startup_members_startup ON public.startup_members(startup_id);
CREATE INDEX idx_startup_members_user ON public.startup_members(user_id);

ALTER TABLE public.startup_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Startup members are viewable by everyone"
  ON public.startup_members FOR SELECT USING (true);
CREATE POLICY "Startup creators can manage members"
  ON public.startup_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.startups
      WHERE id = startup_id AND creator_id = auth.uid()
    )
    OR auth.uid() = user_id
  );
CREATE POLICY "Startup creators or self can remove members"
  ON public.startup_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.startups
      WHERE id = startup_id AND creator_id = auth.uid()
    )
    OR auth.uid() = user_id
  );

-- ============================================================
-- STORAGE: startup-logos bucket
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('startup-logos', 'startup-logos', true);

CREATE POLICY "Startup logos are publicly accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'startup-logos');
CREATE POLICY "Authenticated users can upload startup logos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'startup-logos' AND auth.role() = 'authenticated');
