import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  price_cents: number;
  currency: string;
  stock_quantity: number;
  image_url: string | null;
  featured: boolean;
  category_id: string | null;
};

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("bg-BG", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export default async function ShopPage() {
  const supabase = await createClient();

  const [{ data: categories }, { data: products, error }] = await Promise.all([
    supabase
      .from("categories")
      .select("id,name,slug")
      .eq("active", true)
      .order("sort_order", { ascending: true }),

    supabase
      .from("products")
      .select(`
        id,
        name,
        slug,
        short_description,
        price_cents,
        currency,
        stock_quantity,
        image_url,
        featured,
        category_id
      `)
      .eq("active", true)
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);

  const shopCategories = (categories ?? []) as Category[];
  const shopProducts = (products ?? []) as Product[];

  return (
    <main className="shop-page">
      <section className="shop-hero">
        <div className="shop-hero__inner">
          <Link href="/" className="shop-back">
            ← USS X KREATIV
          </Link>

          <span className="shop-kicker">ОНЛАЙН МАГАЗИН</span>

          <h1>
            Текстилни изделия
            <em> с характер.</em>
          </h1>

          <p>
            Подбрани текстилни продукти от различни производители,
            събрани на едно място от USS X KREATIV.
          </p>
        </div>
      </section>

      <section className="shop-content">
        <div className="shop-content__inner">
          {shopCategories.length > 0 && (
            <nav className="shop-categories" aria-label="Категории">
              <a href="#all" className="shop-category shop-category--active">
                Всички
              </a>

              {shopCategories.map((category) => (
                <a
                  key={category.id}
                  href={`#${category.slug}`}
                  className="shop-category"
                >
                  {category.name}
                </a>
              ))}
            </nav>
          )}

          {error ? (
            <div className="shop-empty">
              <h2>Магазинът се зарежда.</h2>
              <p>Опитайте отново след малко.</p>
            </div>
          ) : shopProducts.length === 0 ? (
            <div className="shop-empty">
              <h2>Първите продукти идват скоро.</h2>
              <p>В момента подготвяме каталога.</p>
            </div>
          ) : (
            <div className="shop-grid" id="all">
              {shopProducts.map((product) => {
                const category = shopCategories.find(
                  (item) => item.id === product.category_id
                );

                return (
                  <article
                    key={product.id}
                    className="shop-product-card"
                    id={category?.slug}
                  >
                    <Link
                      href={`/shop/product/${product.slug}`}
                      className="shop-product-card__image"
                    >
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          loading="lazy"
                        />
                      ) : (
                        <div className="shop-product-card__placeholder">
                          USS X
                        </div>
                      )}

                      {product.featured && (
                        <span className="shop-product-card__badge">
                          Избрано
                        </span>
                      )}
                    </Link>

                    <div className="shop-product-card__body">
                      {category && (
                        <span className="shop-product-card__category">
                          {category.name}
                        </span>
                      )}

                      <h2>
                        <Link href={`/shop/product/${product.slug}`}>
                          {product.name}
                        </Link>
                      </h2>

                      {product.short_description && (
                        <p>{product.short_description}</p>
                      )}

                      <div className="shop-product-card__footer">
                        <strong>
                          {formatPrice(
                            product.price_cents,
                            product.currency
                          )}
                        </strong>

                        <span
                          className={
                            product.stock_quantity > 0
                              ? "shop-stock shop-stock--available"
                              : "shop-stock shop-stock--out"
                          }
                        >
                          {product.stock_quantity > 0
                            ? "В наличност"
                            : "Изчерпан"}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
