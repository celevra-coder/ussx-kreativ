-- =========================================================
-- USS X KREATIV
-- Checkout delivery + payment fields
-- =========================================================

alter table public.orders
  add column if not exists payment_method text
    not null default 'card';

alter table public.orders
  add column if not exists delivery_method text;

alter table public.orders
  add column if not exists courier text;

alter table public.orders
  add column if not exists courier_office text;

alter table public.orders
  add column if not exists delivery_city text;

alter table public.orders
  add column if not exists delivery_postcode text;

alter table public.orders
  add column if not exists delivery_address text;


-- Payment method validation
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_payment_method_check'
  ) then
    alter table public.orders
      add constraint orders_payment_method_check
      check (
        payment_method in (
          'card',
          'cash_on_delivery'
        )
      );
  end if;
end
$$;


-- Delivery method validation
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_delivery_method_check'
  ) then
    alter table public.orders
      add constraint orders_delivery_method_check
      check (
        delivery_method is null
        or delivery_method in (
          'econt_office',
          'speedy_office',
          'address'
        )
      );
  end if;
end
$$;


-- Courier validation
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_courier_check'
  ) then
    alter table public.orders
      add constraint orders_courier_check
      check (
        courier is null
        or courier in (
          'econt',
          'speedy'
        )
      );
  end if;
end
$$;
