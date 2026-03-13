CREATE TABLE public.phone_number_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  phone_number text NOT NULL,
  phone_number_id text NOT NULL,
  purchased_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '30 days'),
  credits_deducted numeric(10,2) NOT NULL DEFAULT 2.00,
  status text NOT NULL DEFAULT 'active',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, phone_number_id)
);

ALTER TABLE public.phone_number_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own phone purchases" ON public.phone_number_purchases
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own phone purchases" ON public.phone_number_purchases
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own phone purchases" ON public.phone_number_purchases
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);