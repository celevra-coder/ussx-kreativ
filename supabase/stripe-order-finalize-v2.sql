create or replace function public.finalize_stripe_order_v2(
  p_order_number text,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_shipping_address jsonb,
  p_subtotal_cents integer,
  p_shipping_cents integer,
  p_total_cents integer,
  p_currency text,
  p_stripe_checkout_session_id text,
  p_stripe_payment_intent_id text,
  p_payment_method text,
  p_delivery_method text,
  p_courier text,
  p_courier_office text,
  p_courier_office_id text,
  p_courier_office_code text,
  p_delivery_city text,
  p_delivery_postcode text,
  p_delivery_address text,
  p_items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_item jsonb;
  v_product_id uuid;
  v_quantity integer;
  v_stock integer;
  v_product_name text;
  v_product_sku text;
  v_unit_price integer;
  v_total_price integer;
begin

  select id
  into v_order_id
  from public.orders
  where stripe_checkout_session_id =
    p_stripe_checkout_session_id
  limit 1;

  if v_order_id is not null then
    return v_order_id;
  end if;

  insert into public.orders (
    order_number,
    customer_name,
    customer_email,
    customer_phone,
    shipping_address,
    subtotal_cents,
    shipping_cents,
    total_cents,
    currency,
    status,
    payment_status,
    stripe_checkout_session_id,
    stripe_payment_intent_id,
    payment_method,
    delivery_method,
    courier,
    courier_office,
    courier_office_id,
    courier_office_code,
    delivery_city,
    delivery_postcode,
    delivery_address
  )
  values (
    p_order_number,
    p_customer_name,
    p_customer_email,
    p_customer_phone,
    coalesce(
      p_shipping_address,
      '{}'::jsonb
    ),
    p_subtotal_cents,
    p_shipping_cents,
    p_total_cents,
    upper(
      coalesce(
        p_currency,
        'EUR'
      )
    ),
    'paid',
    'paid',
    p_stripe_checkout_session_id,
    p_stripe_payment_intent_id,
    coalesce(
      p_payment_method,
      'card'
    ),
    p_delivery_method,
    p_courier,
    nullif(
      p_courier_office,
      ''
    ),
    nullif(
      p_courier_office_id,
      ''
    ),
    nullif(
      p_courier_office_code,
      ''
    ),
    nullif(
      p_delivery_city,
      ''
    ),
    nullif(
      p_delivery_postcode,
      ''
    ),
    nullif(
      p_delivery_address,
      ''
    )
  )
  returning id
  into v_order_id;

  for v_item in
    select value
    from jsonb_array_elements(
      p_items
    )
  loop

    v_product_id :=
      (
        v_item->>
        'product_id'
      )::uuid;

    v_quantity :=
      (
        v_item->>
        'quantity'
      )::integer;

    v_product_name :=
      v_item->>
      'product_name';

    v_product_sku :=
      nullif(
        v_item->>
        'product_sku',
        ''
      );

    v_unit_price :=
      (
        v_item->>
        'unit_price_cents'
      )::integer;

    v_total_price :=
      (
        v_item->>
        'total_price_cents'
      )::integer;

    select stock_quantity
    into v_stock
    from public.products
    where id =
      v_product_id
    for update;

    if not found then
      raise exception
        'Product % no longer exists',
        v_product_id;
    end if;

    if
      v_quantity is null
      or v_quantity <= 0
    then
      raise exception
        'Invalid quantity for product %',
        v_product_id;
    end if;

    if
      v_stock <
      v_quantity
    then
      raise exception
        'Insufficient stock for product %',
        v_product_id;
    end if;

    insert into public.order_items (
      order_id,
      product_id,
      product_name,
      product_sku,
      quantity,
      unit_price_cents,
      total_price_cents,
      selected_size,
      selected_color
    )
    values (
      v_order_id,
      v_product_id,
      v_product_name,
      v_product_sku,
      v_quantity,
      v_unit_price,
      v_total_price,
      nullif(
        v_item->>
        'selected_size',
        ''
      ),
      nullif(
        v_item->>
        'selected_color',
        ''
      )
    );

    update public.products
    set
      stock_quantity =
        stock_quantity -
        v_quantity,

      updated_at =
        now()

    where id =
      v_product_id;

  end loop;

  return v_order_id;

exception
  when unique_violation then

    select id
    into v_order_id
    from public.orders
    where stripe_checkout_session_id =
      p_stripe_checkout_session_id
    limit 1;

    if v_order_id is not null then
      return v_order_id;
    end if;

    raise;
end;
$$;

revoke all
on function public.finalize_stripe_order_v2(
  text,text,text,text,jsonb,
  integer,integer,integer,
  text,text,text,text,text,text,
  text,text,text,text,text,text,
  jsonb
)
from public;

grant execute
on function public.finalize_stripe_order_v2(
  text,text,text,text,jsonb,
  integer,integer,integer,
  text,text,text,text,text,text,
  text,text,text,text,text,text,
  jsonb
)
to service_role;
