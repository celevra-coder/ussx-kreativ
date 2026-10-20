create extension if not exists pgcrypto;

-- =========================
-- CATEGORIES
-- =========================

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- =========================
-- PRODUCTS
-- =========================

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,

  name text not null,
  slug text not null unique,
  short_description text,
  description text,

  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'EUR',

  sku text,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),

  image_url text,
  gallery jsonb not null default '[]'::jsonb,

  sizes jsonb not null default '[]'::jsonb,
  colors jsonb not null default '[]'::jsonb,

  featured boolean not null default false,
  active boolean not null default true,

  seo_title text,
  seo_description text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_id_idx
on public.products(category_id);

create index if not exists products_active_idx
on public.products(active);

create index if not exists products_featured_idx
on public.products(featured);

-- =========================
-- ORDERS
-- =========================

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),

  order_number text not null unique,

  customer_name text not null,
  customer_email text not null,
  customer_phone text,

  shipping_address jsonb not null default '{}'::jsonb,

  subtotal_cents integer not null default 0,
  shipping_cents integer not null default 0,
  total_cents integer not null default 0,

  currency text not null default 'EUR',

  status text not null default 'pending'
    check (status in (
      'pending',
      'paid',
      'processing',
      'shipped',
      'completed',
      'cancelled',
      'refunded'
    )),

  payment_status text not null default 'unpaid'
    check (payment_status in (
      'unpaid',
      'paid',
      'failed',
      'refunded',
      'partially_refunded'
    )),

  stripe_checkout_session_id text,
  stripe_payment_intent_id text,

  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx
on public.orders(created_at desc);

create index if not exists orders_payment_status_idx
on public.orders(payment_status);

-- =========================
-- ORDER ITEMS
-- =========================

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),

  order_id uuid not null
    references public.orders(id)
    on delete cascade,

  product_id uuid
    references public.products(id)
    on delete set null,

  product_name text not null,
  product_sku text,

  quantity integer not null check (quantity > 0),

  unit_price_cents integer not null check (unit_price_cents >= 0),
  total_price_cents integer not null check (total_price_cents >= 0),

  selected_size text,
  selected_color text,

  created_at timestamptz not null default now()
);

create index if not exists order_items_order_id_idx
on public.order_items(order_id);

-- =========================
-- UPDATED_AT
-- =========================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;

create trigger products_set_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;

create trigger orders_set_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();

-- =========================
-- ROW LEVEL SECURITY
-- =========================

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Public visitors can only READ active categories.
drop policy if exists "Public can read active categories"
on public.categories;

create policy "Public can read active categories"
on public.categories
for select
to anon, authenticated
using (active = true);

-- Public visitors can only READ active products.
drop policy if exists "Public can read active products"
on public.products;

create policy "Public can read active products"
on public.products
for select
to anon, authenticated
using (active = true);

-- Orders and order_items intentionally have NO public policies.
-- They will be written/read only by trusted server-side code.

grant select on public.categories to anon, authenticated;
grant select on public.products to anon, authenticated;

-- =========================
-- STARTER CATEGORIES
-- =========================

insert into public.categories (name, slug, description, sort_order)
values
  (
    'Чорапи',
    'chorapi',
    'Текстилни чорапи и модели от различни производители.',
    10
  ),
  (
    'Аксесоари',
    'aksesoari',
    'Текстилни аксесоари и малки изделия.',
    20
  ),
  (
    'Дом и декор',
    'dom-i-dekor',
    'Текстилни изделия за дома и интериора.',
    30
  )
on conflict (slug) do nothing;
