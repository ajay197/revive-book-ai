
-- Call logs table for tracking every call attempt
CREATE TABLE public.call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  retell_call_id TEXT,
  lead_name TEXT,
  lead_phone TEXT,
  status TEXT NOT NULL DEFAULT 'Queued',
  duration_seconds INTEGER DEFAULT 0,
  cost NUMERIC(10,4) DEFAULT 0,
  sentiment TEXT,
  disconnection_reason TEXT,
  attempt_number INTEGER DEFAULT 1,
  call_analysis JSONB,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add retry tracking columns to leads
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMPTZ;

-- RLS for call_logs
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own call logs" ON public.call_logs
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can insert call logs" ON public.call_logs
  FOR INSERT TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update call logs" ON public.call_logs
  FOR UPDATE TO service_role
  USING (true);

-- Enable realtime for call_logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.call_logs;
