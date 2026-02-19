-- ============================================================
-- Update categories for Incubation Hub
-- ============================================================

-- Remove old food-themed categories (only if no posts reference them)
DELETE FROM public.categories
WHERE slug IN ('jisshoku-report', 'kouhou', 'arrange-recipe', 'hanakin')
  AND NOT EXISTS (
    SELECT 1 FROM public.posts WHERE posts.category_id = categories.id
  );

-- Update existing '雑談' sort_order
UPDATE public.categories
SET sort_order = 6
WHERE slug = 'zatsudan';

-- Insert new categories (skip if slug already exists)
INSERT INTO public.categories (name, slug, icon_emoji, sort_order) VALUES
  ('スタートアップニュース', 'startup-news', '📰', 1),
  ('アイデア相談', 'idea-consultation', '💡', 2),
  ('イベント情報', 'events', '📅', 3),
  ('質問・相談', 'questions', '❓', 4),
  ('プロジェクト紹介', 'projects', '🚀', 5),
  ('運営より', 'management', '📢', 7)
ON CONFLICT (slug) DO NOTHING;
