
ALTER TABLE public.phone_number_purchases 
ADD COLUMN IF NOT EXISTS campaign_id uuid,
ADD COLUMN IF NOT EXISTS campaign_name text,
ADD COLUMN IF NOT EXISTS agent_id text,
ADD COLUMN IF NOT EXISTS agent_name text;

-- Clear any existing bad data (purchased without campaign context)
DELETE FROM public.phone_number_purchases WHERE campaign_id IS NULL;
