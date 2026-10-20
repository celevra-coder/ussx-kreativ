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

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9а-я]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  const user = await requireAdmin();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      category_id,
      name,
      slug,
      short_description,
      description,
      price_cents,
      currency,
      sku,
      stock_quantity,
      image_url,
      featured,
      active,
      categories (
        id,
        name,
        slug
      )
    `)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    products: data ?? [],
  });
}

export async function POST(request: Request) {
  const user = await requireAdmin();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await request.json();

  const name = String(body.name ?? "").trim();
  const categoryId =
    String(body.category_id ?? "").trim();

  const price = Number(body.price ?? 0);
  const stock = Number(body.stock_quantity ?? 0);

  if (!name) {
    return NextResponse.json(
      { error: "Липсва име на продукта." },
      { status: 400 }
    );
  }

  if (!categoryId) {
    return NextResponse.json(
      { error: "Изберете категория." },
      { status: 400 }
    );
  }

  if (!Number.isFinite(price) || price < 0) {
    return NextResponse.json(
      { error: "Невалидна цена." },
      { status: 400 }
    );
  }

  if (!Number.isFinite(stock) || stock < 0) {
    return NextResponse.json(
      { error: "Невалидна наличност." },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  let slug =
    slugify(String(body.slug || name));

  if (!slug) {
    slug = `product-${Date.now()}`;
  }

  const { data: existing } = await supabase
    .from("products")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) {
    slug = `${slug}-${Date.now()}`;
  }

  const { data, error } = await supabase
    .from("products")
    .insert({
      name,
      slug,
      category_id: categoryId,

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

      currency: "EUR",

      sku:
        String(body.sku ?? "").trim() ||
        null,

      stock_quantity:
        Math.floor(stock),

      image_url:
        String(body.image_url ?? "").trim() ||
        null,

      featured:
        Boolean(body.featured),

      active:
        body.active !== false,
    })
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
