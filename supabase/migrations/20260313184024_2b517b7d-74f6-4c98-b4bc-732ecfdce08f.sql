CREATE UNIQUE INDEX IF NOT EXISTS idx_phone_number_purchases_unique_active 
ON public.phone_number_purchases (user_id, phone_number) 
WHERE status = 'active';