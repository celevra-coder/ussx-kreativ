import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AddToCartButton from "./AddToCartButton";

type Product = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price_cents: number;
  currency: string;
  stock_quantity: number;
  image_url: string | null;
  gallery: string[] | null;
  sizes: string[] | null;
  colors: string[] | null;
  category_id: string | null;
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("bg-BG", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      short_description,
      description,
      price_cents,
      currency,
      stock_quantity,
      image_url,
      gallery,
      sizes,
      colors,
      category_id
    `)
    .eq("slug", slug)
    .eq("active", true)
    .single();

  if (!product) {
    notFound();
  }

  let category: Category | null = null;

  if (product.category_id) {
    const { data } = await supabase
      .from("categories")
      .select("id,name,slug")
      .eq("id", product.category_id)
      .single();

    category = data as Category | null;
  }

  const item = product as Product;

  return (
    <main className="product-page">
      <div className="product-page__inner">
        <div className="product-page__topbar">
          <Link href="/shop">← Назад към магазина</Link>

          {category && (
            <span>{category.name}</span>
          )}
        </div>

        <div className="product-layout">
          <section className="product-media">
            <div className="product-main-image">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.name}
                />
              ) : (
                <div className="product-image-placeholder">
                  USS X KREATIV
                </div>
              )}
            </div>

            {Array.isArray(item.gallery) && item.gallery.length > 0 && (
              <div className="product-gallery">
                {item.gallery.map((image, index) => (
                  <img
                    key={`${image}-${index}`}
                    src={image}
                    alt={`${item.name} ${index + 2}`}
                    loading="lazy"
                  />
                ))}
              </div>
            )}
          </section>

          <section className="product-info">
            {category && (
              <span className="product-category">
                {category.name}
              </span>
            )}

            <h1>{item.name}</h1>

            {item.short_description && (
              <p className="product-lead">
                {item.short_description}
              </p>
            )}

            <strong className="product-price">
              {formatPrice(item.price_cents, item.currency)}
            </strong>

            <div className="product-stock">
              {item.stock_quantity > 0 ? (
                <span className="product-stock--available">
                  В наличност · {item.stock_quantity} бр.
                </span>
              ) : (
                <span className="product-stock--out">
                  Временно изчерпан
                </span>
              )}
            </div>

            {Array.isArray(item.sizes) && item.sizes.length > 0 && (
              <div className="product-options">
                <span>Размер</span>
                <div className="product-option-list">
                  {item.sizes.map((size) => (
                    <span key={size}>{size}</span>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(item.colors) && item.colors.length > 0 && (
              <div className="product-options">
                <span>Цвят</span>
                <div className="product-option-list">
                  {item.colors.map((color) => (
                    <span key={color}>{color}</span>
                  ))}
                </div>
              </div>
            )}

            <AddToCartButton
              product={{
                id: item.id,
                name: item.name,
                slug: item.slug,
                price_cents: item.price_cents,
                currency: item.currency,
                image_url: item.image_url,
                stock_quantity: item.stock_quantity,
              }}
            />

            {item.description && (
              <div className="product-description">
                <h2>Описание</h2>
                <p>{item.description}</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
