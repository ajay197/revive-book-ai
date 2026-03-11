
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  lead_list TEXT,
  lead_count INTEGER DEFAULT 0,
  agent_id TEXT,
  agent_name TEXT,
  script_id TEXT,
  script_name TEXT,
  status TEXT NOT NULL DEFAULT 'Draft',
  calls_completed INTEGER DEFAULT 0,
  appointments_booked INTEGER DEFAULT 0,
  cost NUMERIC(10,2) DEFAULT 0,
  window_start TEXT DEFAULT '09:00',
  window_end TEXT DEFAULT '17:00',
  timezone TEXT DEFAULT 'America/New_York',
  max_retries INTEGER DEFAULT 3,
  retry_delay INTEGER DEFAULT 24,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own campaigns"
  ON public.campaigns FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own campaigns"
  ON public.campaigns FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns"
  ON public.campaigns FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns"
  ON public.campaigns FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
