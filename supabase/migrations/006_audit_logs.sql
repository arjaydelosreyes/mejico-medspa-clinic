-- 006_audit_logs.sql
-- Append-only audit trail for sensitive actions.
-- Writes require service role key (no INSERT RLS policy).
-- Admins can read via SELECT policy.

CREATE TABLE public.audit_logs (
  id          UUID         DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     UUID         REFERENCES auth.users(id) ON DELETE SET NULL,
  action      TEXT         NOT NULL,
  target_type TEXT,
  target_id   UUID,
  metadata    JSONB        DEFAULT '{}',
  ip_address  TEXT,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins can read all logs
CREATE POLICY "audit_logs_admin_select"
  ON public.audit_logs
  FOR SELECT
  USING (public.is_admin());

-- No INSERT policy — service role key bypasses RLS (used in lib/supabase/service.ts)
-- No UPDATE or DELETE policies — logs are immutable by design
