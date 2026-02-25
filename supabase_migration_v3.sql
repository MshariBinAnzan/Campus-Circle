-- ============================================================
-- CampusCircle — Migration v3: Clubs System
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ─── CLUBS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.clubs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  emoji       TEXT NOT NULL DEFAULT '🎓',
  created_by  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS clubs_created_by_idx ON public.clubs(created_by);
CREATE INDEX IF NOT EXISTS clubs_created_at_idx ON public.clubs(created_at DESC);

ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clubs: read if authenticated"
  ON public.clubs FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "clubs: create if authenticated"
  ON public.clubs FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "clubs: update by creator"
  ON public.clubs FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "clubs: delete by creator"
  ON public.clubs FOR DELETE USING (auth.uid() = created_by);

-- ─── CLUB MEMBERS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.club_members (
  club_id    UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'member',   -- 'admin' | 'member'
  status     TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'approved' | 'declined'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (club_id, user_id)
);

CREATE INDEX IF NOT EXISTS club_members_club_idx   ON public.club_members(club_id);
CREATE INDEX IF NOT EXISTS club_members_user_idx   ON public.club_members(user_id);
CREATE INDEX IF NOT EXISTS club_members_status_idx ON public.club_members(status);

ALTER TABLE public.club_members ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read membership rows (needed to check own status)
CREATE POLICY "club_members: read if authenticated"
  ON public.club_members FOR SELECT USING (auth.role() = 'authenticated');

-- A user can request to join (insert their own row)
CREATE POLICY "club_members: insert own"
  ON public.club_members FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Only the club admin (created_by) can approve/decline requests
CREATE POLICY "club_members: update by club admin"
  ON public.club_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.clubs
      WHERE id = club_members.club_id
      AND created_by = auth.uid()
    )
  );

-- Users can cancel their own membership request
CREATE POLICY "club_members: delete own"
  ON public.club_members FOR DELETE USING (auth.uid() = user_id);

-- ─── CLUB MESSAGES ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.club_messages (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id    UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS club_messages_club_idx     ON public.club_messages(club_id);
CREATE INDEX IF NOT EXISTS club_messages_created_idx  ON public.club_messages(created_at);

ALTER TABLE public.club_messages ENABLE ROW LEVEL SECURITY;

-- Only APPROVED members can read club messages
CREATE POLICY "club_messages: read approved members only"
  ON public.club_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.club_members
      WHERE club_id = club_messages.club_id
      AND user_id = auth.uid()
      AND status = 'approved'
    )
  );

-- Only APPROVED members can send messages
CREATE POLICY "club_messages: insert approved members only"
  ON public.club_messages FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.club_members
      WHERE club_id = club_messages.club_id
      AND user_id = auth.uid()
      AND status = 'approved'
    )
  );

-- Users can delete their own messages
CREATE POLICY "club_messages: delete own"
  ON public.club_messages FOR DELETE USING (auth.uid() = user_id);
