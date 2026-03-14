
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  calcom_booking_id integer,
  title text NOT NULL,
  description text,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  status text NOT NULL DEFAULT 'accepted',
  attendee_name text,
  attendee_email text,
  attendee_phone text,
  event_type_name text,
  event_type_id integer,
  meeting_url text,
  location text,
  lead_id uuid,
  campaign_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own bookings" ON public.bookings FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own bookings" ON public.bookings FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own bookings" ON public.bookings FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Service role can manage bookings" ON public.bookings FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE UNIQUE INDEX bookings_calcom_booking_id_user_id_idx ON public.bookings (calcom_booking_id, user_id);
