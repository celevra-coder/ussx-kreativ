import Link from "next/link";

import { createAdminClient } from "@/lib/supabase/admin";

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
      dateStyle: "short",
      timeStyle: "short",
    }
  ).format(new Date(value));
}

const statusLabels: Record<string, string> = {
  pending: "Чакаща",
  paid: "Платена",
  processing: "Обработва се",
  shipped: "Изпратена",
  completed: "Завършена",
  cancelled: "Отказана",
  refunded: "Възстановена",
};

const paymentLabels: Record<string, string> = {
  paid: "Платено",
  unpaid: "Неплатено",
  failed: "Неуспешно",
  refunded: "Възстановено",
  partially_refunded: "Частично възстановено",
};

export default async function AdminOrdersPage() {
  const supabase =
    createAdminClient();

  const { data: orders } =
    await supabase
      .from("orders")
      .select(`
        id,
        order_number,
        customer_name,
        customer_phone,
        customer_email,
        total_cents,
        currency,
        payment_method,
        payment_status,
        delivery_method,
        courier_office,
        delivery_city,
        status,
        created_at
      `)
      .order(
        "created_at",
        {
          ascending: false,
        }
      );

  const rows =
    orders ?? [];

  return (
    <main className="admin-page">
      <div className="admin-container">

        <div className="admin-products-topbar">

          <div>
            <span className="admin-section-label">
              ПОРЪЧКИ
            </span>

            <h1>
              Всички поръчки
            </h1>
          </div>

          <strong>
            Общо: {rows.length}
          </strong>

        </div>

        <section className="admin-panel">

          <div className="admin-table-wrap">

            <table className="admin-table admin-orders-table">

              <thead>
                <tr>
                  <th>№</th>
                  <th>Дата</th>
                  <th>Клиент</th>
                  <th>Телефон</th>
                  <th>Доставка</th>
                  <th>Плащане</th>
                  <th>Сума</th>
                  <th>Статус</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>

                {rows.map(
                  (order) => (
                    <tr key={order.id}>

                      <td>
                        <strong>
                          {order.order_number}
                        </strong>
                      </td>

                      <td>
                        {formatDate(
                          order.created_at
                        )}
                      </td>

                      <td>
                        <strong>
                          {order.customer_name}
                        </strong>

                        <small>
                          {order.customer_email}
                        </small>
                      </td>

                      <td>
                        {order.customer_phone || "—"}
                      </td>

                      <td>
                        <strong>
                          {order.delivery_method ===
                          "econt_office"
                            ? "Еконт офис"
                            : "Еконт адрес"}
                        </strong>

                        {order.delivery_method ===
                        "econt_office" ? (
                          <>
                            <small>
                              {order.courier_office ||
                                "Офисът не е записан"}
                            </small>

                            {order.delivery_city && (
                              <small>
                                {order.delivery_city}
                              </small>
                            )}
                          </>
                        ) : (
                          <small>
                            {order.delivery_city || ""}
                          </small>
                        )}
                      </td>

                      <td>
                        <strong>
                          {order.payment_method ===
                          "cash_on_delivery"
                            ? "Наложен платеж"
                            : "Карта"}
                        </strong>

                        <small>
                          {paymentLabels[
                            order.payment_status
                          ] ||
                            order.payment_status}
                        </small>
                      </td>

                      <td>
                        <strong>
                          {formatPrice(
                            order.total_cents,
                            order.currency
                          )}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`admin-status admin-status--${order.status}`}
                        >
                          {statusLabels[
                            order.status
                          ] ||
                            order.status}
                        </span>
                      </td>

                      <td>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="admin-table-button"
                        >
                          Отвори
                        </Link>
                      </td>

                    </tr>
                  )
                )}

              </tbody>
            </table>

          </div>

        </section>

      </div>
    </main>
  );
}
