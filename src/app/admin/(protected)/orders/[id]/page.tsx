import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

import OrderStatusControl from "@/components/admin/OrderStatusControl";

function formatPrice(
  cents: number,
  currency = "EUR"
) {
  return new Intl.NumberFormat(
    "bg-BG",
    {
      style: "currency",
      currency,
    }
  ).format(cents / 100);
}

function formatDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    "bg-BG",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(new Date(value));
}

function paymentLabel(
  value: string | null
) {
  if (
    value === "cash_on_delivery"
  ) {
    return "Наложен платеж";
  }

  if (value === "card") {
    return "Банкова карта";
  }

  return value || "—";
}

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const auth = await createClient();

  const {
    data: { user },
  } = await auth.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { id } = await params;

  const supabase =
    createAdminClient();

  const {
    data: order,
    error,
  } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !order) {
    notFound();
  }

  const {
    data: items,
  } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", id)
    .order(
      "created_at",
      {
        ascending: true,
      }
    );

  return (
    <main className="admin-page">
      <div className="admin-container">

        <Link
          href="/admin"
          className="admin-back-link"
        >
          ← Назад към администрацията
        </Link>

        <div className="admin-order-title">
          <div>
            <span>
              ПОРЪЧКА
            </span>

            <h1>
              {order.order_number}
            </h1>

            <small>
              {formatDate(
                order.created_at
              )}
            </small>
          </div>

          <OrderStatusControl
            orderId={order.id}
            initialStatus={
              order.status
            }
          />
        </div>

        <div className="admin-order-grid">

          <section className="admin-panel">
            <h2>
              Клиент
            </h2>

            <div className="admin-detail-list">
              <div>
                <span>Име</span>
                <strong>
                  {order.customer_name}
                </strong>
              </div>

              <div>
                <span>Телефон</span>
                <strong>
                  {order.customer_phone || "—"}
                </strong>
              </div>

              <div>
                <span>Имейл</span>
                <strong>
                  {order.customer_email}
                </strong>
              </div>
            </div>
          </section>

          <section className="admin-panel">
            <h2>
              Плащане
            </h2>

            <div className="admin-detail-list">
              <div>
                <span>
                  Начин
                </span>

                <strong>
                  {paymentLabel(
                    order.payment_method
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Статус
                </span>

                <strong>
                  {order.payment_status}
                </strong>
              </div>

              <div>
                <span>
                  Общо
                </span>

                <strong>
                  {formatPrice(
                    order.total_cents,
                    order.currency
                  )}
                </strong>
              </div>
            </div>
          </section>

          <section className="admin-panel">
            <h2>
              Доставка
            </h2>

            <div className="admin-detail-list">

              <div>
                <span>
                  Куриер
                </span>

                <strong>
                  Еконт
                </strong>
              </div>

              <div>
                <span>
                  Тип
                </span>

                <strong>
                  {order.delivery_method ===
                  "econt_office"
                    ? "До офис"
                    : "До адрес"}
                </strong>
              </div>

              <div>
                <span>
                  Град
                </span>

                <strong>
                  {order.delivery_city || "—"}
                </strong>
              </div>

              {order.delivery_method ===
              "econt_office" ? (
                <>
                  <div>
                    <span>
                      Офис
                    </span>

                    <strong>
                      {order.courier_office || "—"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Код на офис
                    </span>

                    <strong>
                      {order.courier_office_code || "—"}
                    </strong>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span>
                      Адрес
                    </span>

                    <strong>
                      {order.delivery_address || "—"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Пощенски код
                    </span>

                    <strong>
                      {order.delivery_postcode || "—"}
                    </strong>
                  </div>
                </>
              )}

            </div>
          </section>

        </div>

        <section className="admin-panel">
          <h2>
            Продукти
          </h2>

          <div className="admin-order-items">

            {(items ?? []).map(
              (item) => (
                <div
                  key={item.id}
                  className="admin-order-item"
                >
                  <div>
                    <strong>
                      {item.product_name}
                    </strong>

                    {item.product_sku && (
                      <small>
                        SKU: {item.product_sku}
                      </small>
                    )}
                  </div>

                  <div>
                    <span>
                      {item.quantity} бр.
                    </span>

                    <strong>
                      {formatPrice(
                        item.total_price_cents,
                        order.currency
                      )}
                    </strong>
                  </div>
                </div>
              )
            )}

          </div>

          <div className="admin-order-total">
            <span>
              Междинна сума
            </span>

            <strong>
              {formatPrice(
                order.subtotal_cents,
                order.currency
              )}
            </strong>
          </div>

          <div className="admin-order-total">
            <span>
              Доставка
            </span>

            <strong>
              {formatPrice(
                order.shipping_cents,
                order.currency
              )}
            </strong>
          </div>

          <div className="admin-order-total admin-order-total--final">
            <span>
              Общо
            </span>

            <strong>
              {formatPrice(
                order.total_cents,
                order.currency
              )}
            </strong>
          </div>

        </section>

      </div>
    </main>
  );
}
