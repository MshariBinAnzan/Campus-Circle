-- ============================================================
-- CampusCircle — Migration v5: Course Groups
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── 1. course_groups ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.course_groups (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code  TEXT        NOT NULL,          -- e.g. "CS101"
  name         TEXT        NOT NULL,          -- e.g. "Intro to Programming"
  department   TEXT        NOT NULL DEFAULT '',
  created_by   UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.course_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cg: read if authenticated"
  ON public.course_groups FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "cg: insert own"
  ON public.course_groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "cg: creator can delete"
  ON public.course_groups FOR DELETE
  USING (auth.uid() = created_by);

-- ── 2. course_members ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.course_members (
  course_id  UUID        NOT NULL REFERENCES public.course_groups(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES public.profiles(id)      ON DELETE CASCADE,
  joined_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (course_id, user_id)
);

ALTER TABLE public.course_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cm: read if authenticated"
  ON public.course_members FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "cm: join self"
  ON public.course_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cm: leave self"
  ON public.course_members FOR DELETE
  USING (auth.uid() = user_id);

-- ── 3. course_posts ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.course_posts (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id  UUID        NOT NULL REFERENCES public.course_groups(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES public.profiles(id)      ON DELETE CASCADE,
  content    TEXT        NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.course_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cp: members can read"
  ON public.course_posts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.course_members
    WHERE course_id = course_posts.course_id AND user_id = auth.uid()
  ));

CREATE POLICY "cp: members can post"
  ON public.course_posts FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM public.course_members WHERE course_id = course_posts.course_id AND user_id = auth.uid())
  );

CREATE POLICY "cp: author can delete"
  ON public.course_posts FOR DELETE
  USING (auth.uid() = user_id);

-- ── 4. course_messages ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.course_messages (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id  UUID        NOT NULL REFERENCES public.course_groups(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES public.profiles(id)      ON DELETE CASCADE,
  content    TEXT        NOT NULL CHECK (char_length(content) BETWEEN 1 AND 1000),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.course_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cmsg: members can read"
  ON public.course_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.course_members
    WHERE course_id = course_messages.course_id AND user_id = auth.uid()
  ));

CREATE POLICY "cmsg: members can send"
  ON public.course_messages FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM public.course_members WHERE course_id = course_messages.course_id AND user_id = auth.uid())
  );
