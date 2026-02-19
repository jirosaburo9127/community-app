-- ============================================================
-- AVATARS STORAGE BUCKET
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own avatars"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own avatars"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- POINT TRIGGERS
-- ============================================================

-- Add points on post creation (+10)
CREATE OR REPLACE FUNCTION public.update_points_on_post()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles
    SET total_points = total_points + 10
    WHERE id = NEW.author_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles
    SET total_points = GREATEST(total_points - 10, 0)
    WHERE id = OLD.author_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_post_points
  AFTER INSERT OR DELETE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_points_on_post();

-- Add points on comment creation (+3)
CREATE OR REPLACE FUNCTION public.update_points_on_comment()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles
    SET total_points = total_points + 3
    WHERE id = NEW.author_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles
    SET total_points = GREATEST(total_points - 3, 0)
    WHERE id = OLD.author_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_comment_points
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_points_on_comment();

-- Add points on reaction received (+1 to post author)
CREATE OR REPLACE FUNCTION public.update_points_on_reaction()
RETURNS TRIGGER AS $$
DECLARE
  post_author UUID;
BEGIN
  SELECT author_id INTO post_author FROM public.posts WHERE id = (
    CASE
      WHEN TG_OP = 'INSERT' THEN NEW.post_id
      WHEN TG_OP = 'DELETE' THEN OLD.post_id
    END
  );

  IF post_author IS NOT NULL THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.profiles
      SET total_points = total_points + 1
      WHERE id = post_author;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE public.profiles
      SET total_points = GREATEST(total_points - 1, 0)
      WHERE id = post_author;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_reaction_points
  AFTER INSERT OR DELETE ON public.reactions
  FOR EACH ROW EXECUTE FUNCTION public.update_points_on_reaction();
