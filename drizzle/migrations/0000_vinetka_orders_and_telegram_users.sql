-- Telegram users (registered through the bot)
CREATE TABLE public.telegram_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id BIGINT NOT NULL UNIQUE,
  username TEXT,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.telegram_users TO service_role;
ALTER TABLE public.telegram_users ENABLE ROW LEVEL SECURITY;
-- No anon/authenticated policies: bot-only data, reached via service role.

-- Orders placed from the website (no site registration required)
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_no TEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL DEFAULT 'vinetka',
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  telegram_id BIGINT,
  photos_count INTEGER NOT NULL DEFAULT 0,
  pages_count INTEGER NOT NULL DEFAULT 1,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'yangi',
  design JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_created_at ON public.orders (created_at DESC);
CREATE INDEX idx_orders_telegram_id ON public.orders (telegram_id);

GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
-- Orders are written and read only through trusted server code (service role).

-- Sequential order numbers: ORD-YYYY-001
CREATE SEQUENCE public.order_no_seq START 1;
GRANT USAGE ON SEQUENCE public.order_no_seq TO service_role;

CREATE OR REPLACE FUNCTION public.next_order_no()
RETURNS TEXT
LANGUAGE sql
VOLATILE
SET search_path = public
AS $$
  SELECT 'ORD-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.order_no_seq')::text, 3, '0');
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER orders_set_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();