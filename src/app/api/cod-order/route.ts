import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type CartItem = {
  id: string;
  quantity: number;
};

function createOrderNumber() {
  const now = new Date();

  const date =
    now.getUTCFullYear().toString() +
    String(now.getUTCMonth() + 1).padStart(2, "0") +
    String(now.getUTCDate()).padStart(2, "0");

  const random =
    crypto.randomUUID()
      .replace(/-/g, "")
      .slice(0, 10)
      .toUpperCase();

  return `USSX-${date}-${random}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const items: CartItem[] =
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
            "Липсват данни за клиента.",
        },
        { status: 400 }
      );
    }

    if (items.length === 0) {
      return NextResponse.json(
        {
          error:
            "Количката е празна.",
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
            "Не е избран офис на Еконт.",
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
            "Липсва адрес за доставка.",
        },
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
      .filter((item) => item.id);

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
      error: productError,
    } = await supabase
      .from("products")
      .select(
        "id,name,sku,price_cents,currency,stock_quantity,active"
      )
      .in("id", productIds);

    if (productError) {
      throw productError;
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

    const productMap =
      new Map(
        products.map(
          (product) => [
            product.id,
            product,
          ]
        )
      );

    let subtotalCents = 0;

    const orderItems = [];

    for (
      const item of normalizedItems
    ) {
      const product =
        productMap.get(item.id);

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
        item.quantity >
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

      const total =
        product.price_cents *
        item.quantity;

      subtotalCents += total;

      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        product_sku:
          product.sku ?? null,
        quantity: item.quantity,
        unit_price_cents:
          product.price_cents,
        total_price_cents: total,
      });
    }

    const shippingCents = 0;
    const totalCents =
      subtotalCents + shippingCents;

    const currency =
      products[0]?.currency ??
      "EUR";

    const orderNumber =
      createOrderNumber();

    const {
      error: rpcError,
    } = await supabase.rpc(
      "finalize_cod_order",
      {
        p_order_number:
          orderNumber,

        p_customer_name:
          String(customer.name),

        p_customer_email:
          String(customer.email),

        p_customer_phone:
          String(customer.phone),

        p_delivery_method:
          String(delivery.method),

        p_courier: "econt",

        p_courier_office:
          String(
            delivery.office ?? ""
          ),

        p_courier_office_id:
          String(
            delivery.office_id ?? ""
          ),

        p_courier_office_code:
          String(
            delivery.office_code ?? ""
          ),

        p_delivery_city:
          String(
            delivery.city ?? ""
          ),

        p_delivery_postcode:
          String(
            delivery.postcode ?? ""
          ),

        p_delivery_address:
          String(
            delivery.address ?? ""
          ),

        p_subtotal_cents:
          subtotalCents,

        p_shipping_cents:
          shippingCents,

        p_total_cents:
          totalCents,

        p_currency:
          currency,

        p_items:
          orderItems,
      }
    );

    if (rpcError) {
      throw rpcError;
    }

    return NextResponse.json({
      success: true,
      order_number:
        orderNumber,
    });
  }
  catch (error) {
    console.error(
      "COD order error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Поръчката не можа да бъде създадена.",
      },
      { status: 500 }
    );
  }
}
