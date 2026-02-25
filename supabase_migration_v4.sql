-- ============================================================
-- CampusCircle — Migration v4: Admin Delete Policy
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Creates a small table of admin emails so RLS can check it.
-- This lets admins delete any post without needing the service role key.

CREATE TABLE IF NOT EXISTS public.admin_emails (
  email TEXT PRIMARY KEY
);

ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can read (needed for the RLS join below)
CREATE POLICY "admin_emails: read if authenticated"
  ON public.admin_emails FOR SELECT
  USING (auth.role() = 'authenticated');

-- ── Add your admin email(s) below ──────────────────────────────
-- Replace with your actual admin email!
INSERT INTO public.admin_emails (email)
VALUES ('231120489@student.um.edu.sa')  -- ← change this
ON CONFLICT DO NOTHING;

-- ── Allow admins to delete ANY post ───────────────────────────
DROP POLICY IF EXISTS "posts: admin can delete any" ON public.posts;

CREATE POLICY "posts: admin can delete any"
  ON public.posts FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.admin_emails ae
      JOIN public.profiles p ON p.email = ae.email
      WHERE p.id = auth.uid()
    )
  );
