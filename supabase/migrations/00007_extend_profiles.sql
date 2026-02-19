-- ============================================================
-- EXTEND PROFILES for member directory
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student'
    CHECK (role IN ('student', 'entrepreneur', 'mentor', 'investor')),
  ADD COLUMN IF NOT EXISTS company TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS twitter_url TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS github_url TEXT DEFAULT '';
