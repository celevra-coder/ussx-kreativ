"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/shop/CartProvider";

type OrderData = {
  order_number: string;
  customer_email: string;
  total_cents: number;
  currency: string;
  status: string;
  payment_status: string;
};

function formatPrice(
  cents: number,
  currency: string
) {
  return new Intl.NumberFormat("bg-BG", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export default function SuccessClient({
  sessionId,
}: {
  sessionId: string;
}) {
  const { clearCart } = useCart();

  const [order, setOrder] =
    useState<OrderData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    clearCart();

    let cancelled = false;
    let attempts = 0;

    async function loadOrder() {
      attempts += 1;

      try {
        const response = await fetch(
          `/api/order-status?session_id=${encodeURIComponent(
            sessionId
          )}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ??
              "Неуспешно зареждане на поръчката."
          );
        }

        if (cancelled) return;

        if (data.ready && data.order) {
          setOrder(data.order);
          setLoading(false);
          return;
        }

        if (attempts < 12) {
          window.setTimeout(loadOrder, 1000);
        } else {
          setLoading(false);
        }
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "Възникна грешка."
        );

        setLoading(false);
      }
    }

    loadOrder();

    return () => {
      cancelled = true;
    };
  }, [sessionId, clearCart]);

  return (
    <main className="checkout-result-page">
      <div className="checkout-result-card">
        <span>USS X KREATIV</span>

        <h1>Плащането е успешно.</h1>

        {loading ? (
          <p>
            Потвърждаваме поръчката и подготвяме
            номера ѝ...
          </p>
        ) : error ? (
          <p>
            Плащането е прието, но не успяхме да
            заредим детайлите на поръчката.
          </p>
        ) : order ? (
          <>
            <div className="checkout-order-details">
              <div>
                <span>НОМЕР НА ПОРЪЧКА</span>
                <strong>
                  {order.order_number}
                </strong>
              </div>

              <div>
                <span>СУМА</span>
                <strong>
                  {formatPrice(
                    order.total_cents,
                    order.currency
                  )}
                </strong>
              </div>

              <div>
                <span>ИМЕЙЛ</span>
                <strong>
                  {order.customer_email}
                </strong>
              </div>
            </div>

            <p>
              Поръчката е записана успешно.
              Данните за доставката са приети и
              поръчката ще бъде обработена.
            </p>
          </>
        ) : (
          <p>
            Плащането е успешно. Поръчката все още
            се обработва и ще бъде записана след
            потвърждение от Stripe.
          </p>
        )}

        <Link href="/shop">
          Обратно към магазина
        </Link>
      </div>
    </main>
  );
}
