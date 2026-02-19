-- ============================================================
-- CHALLENGES
-- ============================================================
CREATE TABLE public.challenges (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category    TEXT,
  difficulty  TEXT NOT NULL DEFAULT 'beginner'
              CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  creator_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'open'
              CHECK (status IN ('open', 'closed')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_challenges_status ON public.challenges(status, created_at DESC);
CREATE INDEX idx_challenges_creator ON public.challenges(creator_id);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Challenges are viewable by everyone"
  ON public.challenges FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create challenges"
  ON public.challenges FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update own challenges"
  ON public.challenges FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Creators can delete own challenges"
  ON public.challenges FOR DELETE USING (auth.uid() = creator_id);

-- ============================================================
-- CHALLENGE PARTICIPANTS (participation tracking)
-- ============================================================
CREATE TABLE public.challenge_participants (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id  UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (challenge_id, user_id)
);

CREATE INDEX idx_challenge_participants_challenge ON public.challenge_participants(challenge_id);
CREATE INDEX idx_challenge_participants_user ON public.challenge_participants(user_id);

ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants are viewable by everyone"
  ON public.challenge_participants FOR SELECT USING (true);
CREATE POLICY "Authenticated users can join challenges"
  ON public.challenge_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave challenges"
  ON public.challenge_participants FOR DELETE USING (auth.uid() = user_id);
