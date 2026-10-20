"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/shop/CartProvider";

function formatPrice(
  cents: number,
  currency: string
) {
  return new Intl.NumberFormat("bg-BG", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export default function CartPage() {
  const {
    items,
    subtotalCents,
    increaseItem,
    decreaseItem,
    removeItem,
    clearCart,
  } = useCart();

  const [checkoutLoading, setCheckoutLoading] =
    useState(false);

  const [checkoutError, setCheckoutError] =
    useState("");

  const currency = items[0]?.currency ?? "EUR";

  function handleCheckout() {
    window.location.href = "/shop/checkout";
  }

  if (items.length === 0) {
    return (
      <main className="cart-page">
        <div className="cart-page__inner">
          <Link href="/shop" className="cart-back">
            ← Към магазина
          </Link>

          <div className="cart-empty">
            <span>КОЛИЧКА</span>
            <h1>Количката е празна.</h1>

            <p>
              Разгледайте продуктите и добавете нещо,
              което ви харесва.
            </p>

            <Link
              href="/shop"
              className="cart-shop-button"
            >
              Разгледай магазина
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <div className="cart-page__inner">

        <div className="cart-heading">
          <div>
            <Link href="/shop" className="cart-back">
              ← Продължи пазаруването
            </Link>

            <span>КОЛИЧКА</span>
            <h1>Вашата поръчка</h1>
          </div>

          <button
            type="button"
            className="cart-clear"
            onClick={clearCart}
          >
            Изчисти количката
          </button>
        </div>

        <div className="cart-layout">

          <section className="cart-items">
            {items.map((item) => (
              <article
                className="cart-item"
                key={item.id}
              >
                <Link
                  href={`/shop/product/${item.slug}`}
                  className="cart-item__image"
                >
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                    />
                  ) : (
                    <div>USS X</div>
                  )}
                </Link>

                <div className="cart-item__info">

                  <Link
                    href={`/shop/product/${item.slug}`}
                  >
                    <h2>{item.name}</h2>
                  </Link>

                  <strong>
                    {formatPrice(
                      item.price_cents,
                      item.currency
                    )}
                  </strong>

                  <div className="cart-quantity">

                    <button
                      type="button"
                      aria-label="Намали количеството"
                      onClick={() =>
                        decreaseItem(item.id)
                      }
                    >
                      −
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      type="button"
                      aria-label="Увеличи количеството"
                      onClick={() =>
                        increaseItem(item.id)
                      }
                      disabled={
                        item.quantity >=
                        item.stock_quantity
                      }
                    >
                      +
                    </button>

                  </div>

                  <button
                    type="button"
                    className="cart-remove"
                    onClick={() =>
                      removeItem(item.id)
                    }
                  >
                    Премахни
                  </button>
                </div>

                <strong className="cart-item__total">
                  {formatPrice(
                    item.price_cents * item.quantity,
                    item.currency
                  )}
                </strong>
              </article>
            ))}
          </section>

          <aside className="cart-summary">
            <span>ОБОБЩЕНИЕ</span>

            <div className="cart-summary__row">
              <span>Междинна сума</span>

              <strong>
                {formatPrice(
                  subtotalCents,
                  currency
                )}
              </strong>
            </div>

            <p>
              Адресът за доставка, телефонът и
              данните за плащане ще бъдат въведени
              в защитената страница на Stripe.
            </p>

            {checkoutError && (
              <div className="cart-checkout-error">
                {checkoutError}
              </div>
            )}

            <button
              type="button"
              className="cart-checkout-button"
              disabled={checkoutLoading}
              onClick={handleCheckout}
            >
              {checkoutLoading
                ? "Отваряне на Stripe..."
                : "Премини към плащане"}
            </button>

            <small>
              В момента магазинът работи в Stripe
              Test Mode. Реални суми няма да бъдат
              теглени.
            </small>
          </aside>

        </div>
      </div>
    </main>
  );
}
