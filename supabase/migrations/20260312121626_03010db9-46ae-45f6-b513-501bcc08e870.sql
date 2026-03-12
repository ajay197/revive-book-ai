
-- User credits table
CREATE TABLE public.user_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  balance_credits numeric(10,2) NOT NULL DEFAULT 0.00,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own credits" ON public.user_credits
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Credit transactions ledger
CREATE TABLE public.credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('debit', 'credit', 'admin_adjustment', 'purchase_bonus')),
  source text NOT NULL CHECK (source IN ('call', 'admin', 'billing_pack')),
  call_id text,
  amount numeric(10,2) NOT NULL,
  balance_before numeric(10,2) NOT NULL,
  balance_after numeric(10,2) NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions" ON public.credit_transactions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Credit purchase requests
CREATE TABLE public.credit_purchase_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  pack_name text NOT NULL,
  base_credits numeric(10,2) NOT NULL,
  bonus_credits numeric(10,2) NOT NULL DEFAULT 0.00,
  total_credits numeric(10,2) NOT NULL,
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cancelled')),
  request_status text NOT NULL DEFAULT 'pending' CHECK (request_status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.credit_purchase_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own purchase requests" ON public.credit_purchase_requests
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own purchase requests" ON public.credit_purchase_requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- User roles table for admin
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Admin policies for user_credits
CREATE POLICY "Admins can view all credits" ON public.user_credits
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all credits" ON public.user_credits
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert credits" ON public.user_credits
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Admin policies for credit_transactions
CREATE POLICY "Admins can view all transactions" ON public.credit_transactions
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert transactions" ON public.credit_transactions
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR auth.uid() = user_id);

-- Admin policies for purchase requests
CREATE POLICY "Admins can view all purchase requests" ON public.credit_purchase_requests
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update purchase requests" ON public.credit_purchase_requests
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Function to auto-create user_credits row on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, balance_credits)
  VALUES (NEW.id, 0.00);
  RETURN NEW;
END;
$$;

-- Trigger for auto-creating credits on new user
CREATE TRIGGER on_auth_user_created_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_credits();

-- Function to deduct credits (idempotent, called from edge function)
CREATE OR REPLACE FUNCTION public.deduct_call_credits(
  p_user_id uuid,
  p_call_id text,
  p_duration_seconds numeric,
  p_campaign_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_credits_to_deduct numeric(10,2);
  v_current_balance numeric(10,2);
  v_new_balance numeric(10,2);
  v_already_deducted boolean;
BEGIN
  -- Check if already deducted for this call
  SELECT EXISTS(
    SELECT 1 FROM public.credit_transactions
    WHERE call_id = p_call_id AND type = 'debit'
  ) INTO v_already_deducted;

  IF v_already_deducted THEN
    RETURN jsonb_build_object('status', 'already_deducted');
  END IF;

  -- Calculate credits: seconds / 150, rounded to 2 decimals
  v_credits_to_deduct := ROUND(p_duration_seconds / 150.0, 2);

  IF v_credits_to_deduct <= 0 THEN
    RETURN jsonb_build_object('status', 'zero_duration');
  END IF;

  -- Get current balance
  SELECT balance_credits INTO v_current_balance
  FROM public.user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_current_balance IS NULL THEN
    RETURN jsonb_build_object('status', 'no_credit_record');
  END IF;

  v_new_balance := GREATEST(v_current_balance - v_credits_to_deduct, 0);

  -- Update balance
  UPDATE public.user_credits
  SET balance_credits = v_new_balance, updated_at = now()
  WHERE user_id = p_user_id;

  -- Log transaction
  INSERT INTO public.credit_transactions (user_id, type, source, call_id, amount, balance_before, balance_after, metadata)
  VALUES (
    p_user_id, 'debit', 'call', p_call_id, v_credits_to_deduct, v_current_balance, v_new_balance,
    jsonb_build_object(
      'duration_seconds', p_duration_seconds,
      'duration_minutes', ROUND(p_duration_seconds / 60.0, 2),
      'credits_deducted', v_credits_to_deduct,
      'campaign_id', p_campaign_id
    )
  );

  RETURN jsonb_build_object('status', 'deducted', 'deducted', v_credits_to_deduct, 'new_balance', v_new_balance);
END;
$$;

-- Function for admin to adjust credits
CREATE OR REPLACE FUNCTION public.admin_adjust_credits(
  p_admin_id uuid,
  p_user_id uuid,
  p_amount numeric,
  p_reason text DEFAULT ''
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance numeric(10,2);
  v_new_balance numeric(10,2);
  v_is_admin boolean;
BEGIN
  SELECT public.has_role(p_admin_id, 'admin') INTO v_is_admin;
  IF NOT v_is_admin THEN
    RETURN jsonb_build_object('status', 'unauthorized');
  END IF;

  SELECT balance_credits INTO v_current_balance
  FROM public.user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_current_balance IS NULL THEN
    -- Create record if not exists
    INSERT INTO public.user_credits (user_id, balance_credits)
    VALUES (p_user_id, GREATEST(p_amount, 0));
    v_current_balance := 0;
  END IF;

  v_new_balance := GREATEST(v_current_balance + p_amount, 0);

  UPDATE public.user_credits
  SET balance_credits = v_new_balance, updated_at = now()
  WHERE user_id = p_user_id;

  INSERT INTO public.credit_transactions (user_id, type, source, amount, balance_before, balance_after, metadata)
  VALUES (
    p_user_id,
    CASE WHEN p_amount >= 0 THEN 'admin_adjustment' ELSE 'debit' END,
    'admin',
    ABS(p_amount),
    v_current_balance,
    v_new_balance,
    jsonb_build_object('reason', p_reason, 'admin_id', p_admin_id)
  );

  RETURN jsonb_build_object('status', 'success', 'previous_balance', v_current_balance, 'new_balance', v_new_balance);
END;
$$;

-- Updated at trigger for user_credits
CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON public.user_credits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Updated at trigger for credit_purchase_requests
CREATE TRIGGER update_credit_purchase_requests_updated_at
  BEFORE UPDATE ON public.credit_purchase_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
