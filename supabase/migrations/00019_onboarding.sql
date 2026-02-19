-- Add onboarding_completed flag to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false;

-- Backfill existing users who have filled out their profile
UPDATE profiles SET onboarding_completed = true WHERE bio != '' OR role IS NOT NULL;
