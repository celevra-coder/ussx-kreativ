import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const auth = await createClient();

  const {
    data: { user },
  } = await auth.auth.getUser();

  return user;
}

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  const user = await requireAdmin();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await params;
  const body = await request.json();

  const price = Number(body.price ?? 0);
  const stock =
    Number(body.stock_quantity ?? 0);

  const supabase =
    createAdminClient();

  const { data, error } = await supabase
    .from("products")
    .update({
      name:
        String(body.name ?? "").trim(),

      category_id:
        String(
          body.category_id ?? ""
        ).trim() || null,

      short_description:
        String(
          body.short_description ?? ""
        ).trim() || null,

      description:
        String(
          body.description ?? ""
        ).trim() || null,

      price_cents:
        Math.round(price * 100),

      sku:
        String(body.sku ?? "").trim() ||
        null,

      stock_quantity:
        Math.max(
          0,
          Math.floor(stock)
        ),

      image_url:
        String(
          body.image_url ?? ""
        ).trim() || null,

      featured:
        Boolean(body.featured),

      active:
        Boolean(body.active),

      updated_at:
        new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    product: data,
  });
}

export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  const user = await requireAdmin();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await params;

  const supabase =
    createAdminClient();

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
  });
}
