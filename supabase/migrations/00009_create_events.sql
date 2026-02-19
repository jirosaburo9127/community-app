-- ============================================================
-- EVENTS
-- ============================================================
CREATE TABLE public.events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  description  TEXT NOT NULL DEFAULT '',
  event_date   TIMESTAMPTZ NOT NULL,
  end_date     TIMESTAMPTZ,
  location     TEXT NOT NULL DEFAULT '',
  capacity     INTEGER,
  image_url    TEXT,
  organizer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_date ON public.events(event_date);
CREATE INDEX idx_events_organizer ON public.events(organizer_id);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events are viewable by everyone"
  ON public.events FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create events"
  ON public.events FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Organizers can update own events"
  ON public.events FOR UPDATE USING (auth.uid() = organizer_id);
CREATE POLICY "Organizers can delete own events"
  ON public.events FOR DELETE USING (auth.uid() = organizer_id);

-- ============================================================
-- EVENT REGISTRATIONS
-- ============================================================
CREATE TABLE public.event_registrations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id   UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status     TEXT NOT NULL DEFAULT 'registered'
             CHECK (status IN ('registered', 'attended', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);

CREATE INDEX idx_event_registrations_event ON public.event_registrations(event_id);
CREATE INDEX idx_event_registrations_user ON public.event_registrations(user_id);

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Event registrations are viewable by everyone"
  ON public.event_registrations FOR SELECT USING (true);
CREATE POLICY "Users can register for events"
  ON public.event_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own registrations"
  ON public.event_registrations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can cancel own registrations"
  ON public.event_registrations FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- STORAGE: event-images bucket
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('event-images', 'event-images', true);

CREATE POLICY "Event images are publicly accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'event-images');
CREATE POLICY "Authenticated users can upload event images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'event-images' AND auth.role() = 'authenticated');
