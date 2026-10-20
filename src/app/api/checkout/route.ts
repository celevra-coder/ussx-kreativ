import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

type CheckoutItem = {
  id: string;
  quantity: number;
};

export async function POST(request: Request) {
  try {
    const stripeSecretKey =
      process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "Stripe secret key is missing." },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey);

    const body = await request.json();

    const items: CheckoutItem[] =
      Array.isArray(body?.items)
        ? body.items
        : [];

    const customer = body?.customer ?? {};
    const delivery = body?.delivery ?? {};

    if (
      !customer.name ||
      !customer.email ||
      !customer.phone
    ) {
      return NextResponse.json(
        {
          error:
            "Моля, попълнете име, имейл и телефон.",
        },
        { status: 400 }
      );
    }

    if (
      delivery.method !== "econt_office" &&
      delivery.method !== "address"
    ) {
      return NextResponse.json(
        {
          error:
            "Невалиден начин на доставка.",
        },
        { status: 400 }
      );
    }

    if (
      delivery.method === "econt_office" &&
      !delivery.office_id
    ) {
      return NextResponse.json(
        {
          error:
            "Моля, изберете офис на Еконт.",
        },
        { status: 400 }
      );
    }

    if (
      delivery.method === "address" &&
      (!delivery.city || !delivery.address)
    ) {
      return NextResponse.json(
        {
          error:
            "Моля, въведете адрес за доставка.",
        },
        { status: 400 }
      );
    }

    if (items.length === 0) {
      return NextResponse.json(
        { error: "Количката е празна." },
        { status: 400 }
      );
    }

    const normalizedItems = items
      .map((item) => ({
        id: String(item.id ?? ""),
        quantity: Math.max(
          1,
          Math.min(
            99,
            Number.parseInt(
              String(item.quantity ?? 1),
              10
            ) || 1
          )
        ),
      }))
      .filter((item) => item.id.length > 0);

    const productIds = [
      ...new Set(
        normalizedItems.map(
          (item) => item.id
        )
      ),
    ];

    const supabase =
      createAdminClient();

    const {
      data: products,
      error,
    } = await supabase
      .from("products")
      .select(
        "id,name,slug,sku,price_cents,currency,image_url,stock_quantity,active"
      )
      .in("id", productIds);

    if (error) {
      throw error;
    }

    if (
      !products ||
      products.length !==
        productIds.length
    ) {
      return NextResponse.json(
        {
          error:
            "Някой от продуктите вече не е наличен.",
        },
        { status: 400 }
      );
    }

    const productMap = new Map(
      products.map(
        (product) => [
          product.id,
          product,
        ]
      )
    );

    const lineItems:
      Stripe.Checkout.SessionCreateParams.LineItem[] =
      [];

    for (
      const cartItem of normalizedItems
    ) {
      const product =
        productMap.get(cartItem.id);

      if (
        !product ||
        !product.active
      ) {
        return NextResponse.json(
          {
            error:
              "Някой от продуктите вече не се предлага.",
          },
          { status: 400 }
        );
      }

      if (
        product.stock_quantity <= 0 ||
        cartItem.quantity >
          product.stock_quantity
      ) {
        return NextResponse.json(
          {
            error:
              `Недостатъчна наличност за „${product.name}“.`,
          },
          { status: 400 }
        );
      }

      const productData:
        Stripe.Checkout.SessionCreateParams.LineItem.PriceData.ProductData =
        {
          name: product.name,
          metadata: {
            product_id:
              product.id,
            product_sku:
              product.sku ?? "",
          },
        };

      if (product.image_url) {
        productData.images = [
          product.image_url,
        ];
      }

      lineItems.push({
        quantity:
          cartItem.quantity,

        price_data: {
          currency:
            String(
              product.currency ?? "EUR"
            ).toLowerCase(),

          unit_amount:
            product.price_cents,

          product_data:
            productData,
        },
      });
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ??
      "http://localhost:3001";

    const session =
      await stripe.checkout.sessions.create({
        mode: "payment",

        line_items:
          lineItems,

        customer_email:
          String(customer.email),

        success_url:
          `${siteUrl}/shop/success?session_id={CHECKOUT_SESSION_ID}`,

        cancel_url:
          `${siteUrl}/shop/checkout`,

        billing_address_collection:
          "auto",

        metadata: {
          source:
            "ussx-kreativ-shop",

          customer_name:
            String(customer.name),

          customer_phone:
            String(customer.phone),

          payment_method:
            "card",

          delivery_method:
            String(delivery.method),

          courier:
            "econt",

          courier_office:
            String(
              delivery.office ?? ""
            ),

          courier_office_id:
            String(
              delivery.office_id ?? ""
            ),

          courier_office_code:
            String(
              delivery.office_code ?? ""
            ),

          delivery_city:
            String(
              delivery.city ?? ""
            ),

          delivery_postcode:
            String(
              delivery.postcode ?? ""
            ),

          delivery_address:
            String(
              delivery.address ?? ""
            ),
        },
      });

    if (!session.url) {
      return NextResponse.json(
        {
          error:
            "Stripe не върна адрес за плащане.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: session.url,
    });
  }
  catch (error) {
    console.error(
      "Stripe checkout error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Неуспешно стартиране на плащането.",
      },
      { status: 500 }
    );
  }
}
