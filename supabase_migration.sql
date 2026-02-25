-- ============================================================
-- CampusCircle — Supabase SQL Migration v2
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ─── Extensions ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── TABLES ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT UNIQUE NOT NULL,
  display_name  TEXT NOT NULL,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.posts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  image_url   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.likes (
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id    UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

CREATE TABLE IF NOT EXISTS public.comments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id     UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reports (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id     UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  reason      TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status      TEXT NOT NULL DEFAULT 'pending'  -- 'pending' | 'reviewed' | 'dismissed'
);

-- ─── INDEXES ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS profiles_email_idx        ON public.profiles(email);
CREATE INDEX IF NOT EXISTS posts_user_id_idx         ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS posts_created_at_idx      ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS likes_post_id_idx         ON public.likes(post_id);
CREATE INDEX IF NOT EXISTS comments_post_id_idx      ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS comments_user_id_idx      ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS comments_created_at_idx   ON public.comments(created_at);
CREATE INDEX IF NOT EXISTS reports_post_id_idx       ON public.reports(post_id);
CREATE INDEX IF NOT EXISTS reports_status_idx        ON public.reports(status);
CREATE INDEX IF NOT EXISTS reports_created_at_idx    ON public.reports(created_at DESC);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports  ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles: read if authenticated"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "profiles: insert own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles: update own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- posts
CREATE POLICY "posts: read if authenticated"
  ON public.posts FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "posts: insert own"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "posts: update own"
  ON public.posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "posts: delete own"
  ON public.posts FOR DELETE
  USING (auth.uid() = user_id);

-- likes
CREATE POLICY "likes: read if authenticated"
  ON public.likes FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "likes: insert own"
  ON public.likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "likes: delete own"
  ON public.likes FOR DELETE
  USING (auth.uid() = user_id);

-- comments
CREATE POLICY "comments: read if authenticated"
  ON public.comments FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "comments: insert own"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comments: update own"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "comments: delete own"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

-- reports: any authenticated user can insert; only the reporter can see their own
-- Admins bypass RLS via the service role key (used in route handler)
CREATE POLICY "reports: insert if authenticated"
  ON public.reports FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = reporter_id);

CREATE POLICY "reports: read own"
  ON public.reports FOR SELECT
  USING (auth.uid() = reporter_id);

-- reports: allow service role to update status (admin actions)
CREATE POLICY "reports: update status"
  ON public.reports FOR UPDATE
  USING (auth.role() = 'authenticated');

-- ─── TRIGGER: Auto-create profile on signup ──────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      split_part(NEW.email, '@', 1)
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ─── TRIGGER: Sync email on update ───────────────────────────
CREATE OR REPLACE FUNCTION public.handle_user_email_change()
RETURNS trigger AS $$
BEGIN
  UPDATE public.profiles
  SET email = NEW.email
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;

CREATE TRIGGER on_auth_user_email_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_email_change();

-- ─── STORAGE: post-images bucket ─────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

-- Only authenticated users can upload
CREATE POLICY "post-images: upload if authenticated"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'post-images'
    AND auth.role() = 'authenticated'
  );

-- Public read (bucket is public)
CREATE POLICY "post-images: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-images');

-- Owner can delete (files stored as userId/filename)
CREATE POLICY "post-images: delete own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'post-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Owner can update/upsert (for avatar replacement)
CREATE POLICY "post-images: update own"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'post-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
