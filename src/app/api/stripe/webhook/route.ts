import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type OrderItemPayload = {
  product_id: string;
  product_name: string;
  product_sku: string | null;
  quantity: number;
  unit_price_cents: number;
  total_price_cents: number;
  selected_size: string | null;
  selected_color: string | null;
};

function createOrderNumber(
  sessionId: string
) {
  const now = new Date();

  const date =
    now.getUTCFullYear().toString() +
    String(
      now.getUTCMonth() + 1
    ).padStart(2, "0") +
    String(
      now.getUTCDate()
    ).padStart(2, "0");

  const suffix =
    sessionId
      .replace(
        /[^a-zA-Z0-9]/g,
        ""
      )
      .slice(-10)
      .toUpperCase();

  return `USSX-${date}-${suffix}`;
}

async function finalizePaidCheckout(
  stripe: Stripe,
  session: Stripe.Checkout.Session
) {
  const supabase =
    createAdminClient();

  const { data: existing } =
    await supabase
      .from("orders")
      .select("id")
      .eq(
        "stripe_checkout_session_id",
        session.id
      )
      .maybeSingle();

  if (existing?.id) {
    return existing.id;
  }

  const lineItems =
    await stripe.checkout.sessions.listLineItems(
      session.id,
      {
        limit: 100,
        expand: [
          "data.price.product",
        ],
      }
    );

  const items:
    OrderItemPayload[] = [];

  for (
    const line of lineItems.data
  ) {
    const price =
      line.price;

    if (!price) {
      throw new Error(
        `Stripe line item ${line.id} has no price.`
      );
    }

    const stripeProduct =
      price.product;

    if (
      typeof stripeProduct ===
        "string" ||
      !stripeProduct ||
      "deleted" in stripeProduct
    ) {
      throw new Error(
        `Stripe product metadata unavailable for ${line.id}.`
      );
    }

    const productId =
      stripeProduct.metadata
        ?.product_id;

    if (!productId) {
      throw new Error(
        `Missing product_id metadata for ${line.id}.`
      );
    }

    const quantity =
      line.quantity ?? 1;

    const unitAmount =
      price.unit_amount ??
      Math.round(
        (line.amount_subtotal ?? 0) /
          Math.max(
            quantity,
            1
          )
      );

    items.push({
      product_id:
        productId,

      product_name:
        line.description ||
        stripeProduct.name ||
        "Продукт",

      product_sku:
        stripeProduct.metadata
          ?.product_sku ||
        null,

      quantity,

      unit_price_cents:
        unitAmount,

      total_price_cents:
        line.amount_total ??
        unitAmount * quantity,

      selected_size:
        null,

      selected_color:
        null,
    });
  }

  const metadata =
    session.metadata ?? {};

  const customer =
    session.customer_details;

  const customerEmail =
    customer?.email ??
    session.customer_email;

  if (!customerEmail) {
    throw new Error(
      "Stripe Checkout did not return customer email."
    );
  }

  const customerName =
    metadata.customer_name ||
    customer?.name ||
    "Клиент";

  const customerPhone =
    metadata.customer_phone ||
    customer?.phone ||
    null;

  const paymentIntentId =
    typeof session.payment_intent ===
      "string"
      ? session.payment_intent
      : session.payment_intent
          ?.id ?? null;

  const shippingCents =
    session.total_details
      ?.amount_shipping ?? 0;

  const shippingAddress = {
    city:
      metadata.delivery_city ??
      "",

    postcode:
      metadata.delivery_postcode ??
      "",

    address:
      metadata.delivery_address ??
      "",

    office:
      metadata.courier_office ??
      "",

    office_id:
      metadata.courier_office_id ??
      "",

    office_code:
      metadata.courier_office_code ??
      "",
  };

  const {
    data,
    error,
  } = await supabase.rpc(
    "finalize_stripe_order_v2",
    {
      p_order_number:
        createOrderNumber(
          session.id
        ),

      p_customer_name:
        customerName,

      p_customer_email:
        customerEmail,

      p_customer_phone:
        customerPhone,

      p_shipping_address:
        shippingAddress,

      p_subtotal_cents:
        session.amount_subtotal ??
        0,

      p_shipping_cents:
        shippingCents,

      p_total_cents:
        session.amount_total ??
        0,

      p_currency:
        (
          session.currency ??
          "eur"
        ).toUpperCase(),

      p_stripe_checkout_session_id:
        session.id,

      p_stripe_payment_intent_id:
        paymentIntentId,

      p_payment_method:
        "card",

      p_delivery_method:
        metadata.delivery_method ??
        null,

      p_courier:
        metadata.courier ??
        "econt",

      p_courier_office:
        metadata.courier_office ??
        null,

      p_courier_office_id:
        metadata.courier_office_id ??
        null,

      p_courier_office_code:
        metadata.courier_office_code ??
        null,

      p_delivery_city:
        metadata.delivery_city ??
        null,

      p_delivery_postcode:
        metadata.delivery_postcode ??
        null,

      p_delivery_address:
        metadata.delivery_address ??
        null,

      p_items:
        items,
    }
  );

  if (error) {
    throw new Error(
      `Supabase finalize_stripe_order_v2 failed: ${error.message}`
    );
  }

  return data;
}

export async function POST(
  request: Request
) {
  const stripeSecretKey =
    process.env.STRIPE_SECRET_KEY;

  const webhookSecret =
    process.env.STRIPE_WEBHOOK_SECRET;

  if (
    !stripeSecretKey ||
    !webhookSecret
  ) {
    return NextResponse.json(
      {
        error:
          "Stripe webhook environment variables are missing.",
      },
      { status: 500 }
    );
  }

  const stripe =
    new Stripe(
      stripeSecretKey
    );

  const signature =
    request.headers.get(
      "stripe-signature"
    );

  if (!signature) {
    return NextResponse.json(
      {
        error:
          "Missing Stripe signature.",
      },
      { status: 400 }
    );
  }

  const body =
    await request.text();

  let event:
    Stripe.Event;

  try {
    event =
      stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
  }
  catch (error) {
    console.error(
      "Stripe webhook signature error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Invalid webhook signature.",
      },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session =
          event.data
            .object as Stripe.Checkout.Session;

        if (
          session.payment_status ===
          "paid"
        ) {
          await finalizePaidCheckout(
            stripe,
            session
          );
        }

        break;
      }

      case "checkout.session.async_payment_failed":
        console.warn(
          "Async Stripe payment failed:",
          event.data.object.id
        );

        break;

      default:
        break;
    }

    return NextResponse.json({
      received: true,
    });
  }
  catch (error) {
    console.error(
      "Stripe webhook processing error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Webhook processing failed.",
      },
      { status: 500 }
    );
  }
}
