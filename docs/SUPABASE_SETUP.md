# Supabase (Option B) — Frontend anon key

This site is static (GitHub Pages). Option B uses the Supabase **anon public** key in the browser.

## 1) Create tables in Supabase (SQL)

In Supabase: **SQL Editor → New query**, run:

```sql
-- Products (public read)
create table if not exists public.products (
  id text primary key,
  name text not null,
  category text not null,
  price numeric not null,
  rating numeric default 0,
  reviews int default 0,
  badge text,
  image text,
  description text,
  discount_pct int default 50,
  created_at timestamp with time zone default now()
);

-- Consultation requests (public insert)
create table if not exists public.consult_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  session_type text not null,
  timeline text,
  notes text,
  created_at timestamp with time zone default now()
);
```

## 2) Enable Row Level Security (RLS) + policies

```sql
alter table public.products enable row level security;
alter table public.consult_requests enable row level security;

-- Anyone can read products
create policy "public read products"
on public.products
for select
to anon
using (true);

-- Anyone can submit a consultation request
create policy "public insert consult requests"
on public.consult_requests
for insert
to anon
with check (true);
```

⚠️ Note: This allows public inserts, so you may get spam.
Recommended next step: add rate limits / captcha via a backend (Option A).

## 3) Add your Supabase keys to the site

Edit:
- `docs/js/supabase-config.js`

Set:
- `window.SUPABASE_URL`
- `window.SUPABASE_ANON_KEY`

## 4) Add products

Insert some demo rows into `public.products`.
Make sure `image` is a valid URL or a path like `./assets/product-tee.svg`.

## 5) Verify

- Home + Shop should show products from Supabase.
- Consultation form should insert into `public.consult_requests`.
