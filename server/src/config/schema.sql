-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.portfolio_holdings (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  stock_id bigint NOT NULL,
  volume numeric NOT NULL CHECK (volume >= 0::numeric),
  avg_price numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT portfolio_holdings_pkey PRIMARY KEY (id),
  CONSTRAINT portfolio_holdings_stock_id_fkey FOREIGN KEY (stock_id) REFERENCES public.stocks(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  username text NOT NULL UNIQUE CHECK (char_length(username) >= 3),
  avatar_url text,
  init_invest numeric NOT NULL DEFAULT 100000,
  balance numeric NOT NULL DEFAULT 100000,
  holdings numeric NOT NULL DEFAULT 0,
  net_profit numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.stock_prices (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  stock_id bigint NOT NULL,
  date date NOT NULL,
  price numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT stock_prices_pkey PRIMARY KEY (id),
  CONSTRAINT stock_prices_stock_id_fkey FOREIGN KEY (stock_id) REFERENCES public.stocks(id)
);
CREATE TABLE public.stocks (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  symbol character varying NOT NULL UNIQUE,
  name character varying,
  logo_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT stocks_pkey PRIMARY KEY (id),
  CONSTRAINT stocks_logo_id_fkey FOREIGN KEY (logo_id) REFERENCES storage.objects(id)
);
CREATE TABLE public.transactions (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  stock_id bigint,
  type USER-DEFINED,
  volume bigint,
  price double precision,
  date date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT transactions_stock_id_fkey FOREIGN KEY (stock_id) REFERENCES public.stocks(id)
);