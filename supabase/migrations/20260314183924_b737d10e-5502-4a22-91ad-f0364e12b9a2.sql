
-- Junction table: each lead can be in multiple campaigns with independent status tracking
CREATE TABLE public.campaign_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'New',
  retell_call_id text,
  retry_count integer NOT NULL DEFAULT 0,
  next_retry_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, lead_id)
);

-- RLS
ALTER TABLE public.campaign_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own campaign_leads"
  ON public.campaign_leads FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own campaign_leads"
  ON public.campaign_leads FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own campaign_leads"
  ON public.campaign_leads FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own campaign_leads"
  ON public.campaign_leads FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage campaign_leads"
  ON public.campaign_leads FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Migrate existing lead-campaign assignments into the junction table
INSERT INTO public.campaign_leads (campaign_id, lead_id, user_id, status, retell_call_id, retry_count, next_retry_at)
SELECT c.id, l.id, l.user_id, COALESCE(l.status, 'New'), l.retell_call_id, COALESCE(l.retry_count, 0), l.next_retry_at
FROM public.leads l
JOIN public.campaigns c ON c.name = l.campaign AND c.user_id = l.user_id
WHERE l.campaign IS NOT NULL;
