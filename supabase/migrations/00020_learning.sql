-- ============================================================
-- Learning: courses, lessons, enrollments, completions
-- ============================================================

-- Courses
CREATE TABLE public.courses (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  description      TEXT NOT NULL DEFAULT '',
  cover_image_url  TEXT,
  difficulty       TEXT NOT NULL DEFAULT 'beginner'
                   CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  instructor_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_published     BOOLEAN NOT NULL DEFAULT false,
  lesson_count     INTEGER NOT NULL DEFAULT 0,
  enrollment_count INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_courses_published ON public.courses(is_published, created_at DESC);
CREATE INDEX idx_courses_instructor ON public.courses(instructor_id);

-- Lessons
CREATE TABLE public.lessons (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id  UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  content    TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_lessons_course ON public.lessons(course_id, sort_order);

-- Course enrollments
CREATE TABLE public.course_enrollments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id    UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ,
  enrolled_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(course_id, user_id)
);

CREATE INDEX idx_enrollments_user ON public.course_enrollments(user_id);

-- Lesson completions
CREATE TABLE public.lesson_completions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id    UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(lesson_id, user_id)
);

CREATE INDEX idx_completions_user ON public.lesson_completions(user_id);

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_completions ENABLE ROW LEVEL SECURITY;

-- Courses
CREATE POLICY "Courses are viewable by everyone"
  ON public.courses FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create courses"
  ON public.courses FOR INSERT WITH CHECK (auth.uid() = instructor_id);
CREATE POLICY "Instructor can update own courses"
  ON public.courses FOR UPDATE USING (auth.uid() = instructor_id);
CREATE POLICY "Instructor can delete own courses"
  ON public.courses FOR DELETE USING (auth.uid() = instructor_id);

-- Lessons
CREATE POLICY "Lessons are viewable by everyone"
  ON public.lessons FOR SELECT USING (true);
CREATE POLICY "Course instructor can create lessons"
  ON public.lessons FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = lessons.course_id AND courses.instructor_id = auth.uid()
    )
  );
CREATE POLICY "Course instructor can update lessons"
  ON public.lessons FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = lessons.course_id AND courses.instructor_id = auth.uid()
    )
  );
CREATE POLICY "Course instructor can delete lessons"
  ON public.lessons FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = lessons.course_id AND courses.instructor_id = auth.uid()
    )
  );

-- Enrollments
CREATE POLICY "Users can view own enrollments"
  ON public.course_enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can enroll themselves"
  ON public.course_enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own enrollments"
  ON public.course_enrollments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own enrollments"
  ON public.course_enrollments FOR DELETE USING (auth.uid() = user_id);

-- Completions
CREATE POLICY "Users can view own completions"
  ON public.lesson_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can mark lessons complete"
  ON public.lesson_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own completions"
  ON public.lesson_completions FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- Counter triggers
-- ============================================================

-- lesson_count on courses
CREATE OR REPLACE FUNCTION update_course_lesson_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.courses SET lesson_count = lesson_count + 1 WHERE id = NEW.course_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.courses SET lesson_count = lesson_count - 1 WHERE id = OLD.course_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_lesson_count
AFTER INSERT OR DELETE ON public.lessons
FOR EACH ROW EXECUTE FUNCTION update_course_lesson_count();

-- enrollment_count on courses
CREATE OR REPLACE FUNCTION update_course_enrollment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.courses SET enrollment_count = enrollment_count + 1 WHERE id = NEW.course_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.courses SET enrollment_count = enrollment_count - 1 WHERE id = OLD.course_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_enrollment_count
AFTER INSERT OR DELETE ON public.course_enrollments
FOR EACH ROW EXECUTE FUNCTION update_course_enrollment_count();

-- ============================================================
-- Points triggers
-- ============================================================

-- +5pt on lesson completion
CREATE OR REPLACE FUNCTION award_lesson_completion_points()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET total_points = total_points + 5
  WHERE id = NEW.user_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_lesson_completion_points
AFTER INSERT ON public.lesson_completions
FOR EACH ROW EXECUTE FUNCTION award_lesson_completion_points();

-- +20pt on course completion
CREATE OR REPLACE FUNCTION award_course_completion_points()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed_at IS NOT NULL AND (OLD.completed_at IS NULL) THEN
    UPDATE public.profiles
    SET total_points = total_points + 20
    WHERE id = NEW.user_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_course_completion_points
AFTER UPDATE ON public.course_enrollments
FOR EACH ROW EXECUTE FUNCTION award_course_completion_points();

-- ============================================================
-- Storage bucket for course cover images
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('course-images', 'course-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload course images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'course-images' AND auth.role() = 'authenticated');
CREATE POLICY "Anyone can view course images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'course-images');
