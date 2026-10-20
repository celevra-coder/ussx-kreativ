import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function formatPrice(
  cents: number,
  currency = "EUR"
) {
  return new Intl.NumberFormat("bg-BG", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("bg-BG", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
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

export default async function AdminPage() {
  const auth = await createClient();

  const {
    data: { user },
  } = await auth.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const supabase = createAdminClient();

  const [
    ordersResult,
    productsResult,
  ] = await Promise.all([
    supabase
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
      .order("created_at", {
        ascending: false,
      })
      .limit(50),

    supabase
      .from("products")
      .select(`
        id,
        name,
        sku,
        stock_quantity,
        price_cents,
        currency,
        active,
        featured
      `)
      .order("created_at", {
        ascending: false,
      }),
  ]);

  const orders = ordersResult.data ?? [];
  const products = productsResult.data ?? [];

  const pendingOrders =
    orders.filter(
      (order) =>
        order.status === "pending" ||
        order.status === "paid"
    ).length;

  const lowStock =
    products.filter(
      (product) =>
        product.stock_quantity <= 3
    ).length;

  return (
    <main className="admin-page">
      <div className="admin-container">

        <header className="admin-header">
          <div>
            <span>USS X KREATIV</span>

            <h1>
              Администрация
            </h1>

            <small>
              {user.email}
            </small>
          </div>

          <div className="admin-header-actions">
            <Link href="/admin/products">
              Продукти
            </Link>

            <Link href="/shop">
              Магазин
            </Link>
          </div>
        </header>

        <section className="admin-stats">

          <div>
            <span>ОБЩО ПОРЪЧКИ</span>
            <strong>
              {orders.length}
            </strong>
          </div>

          <div>
            <span>ЗА ОБРАБОТКА</span>
            <strong>
              {pendingOrders}
            </strong>
          </div>

          <div>
            <span>ПРОДУКТИ</span>
            <strong>
              {products.length}
            </strong>
          </div>

          <div>
            <span>НИСКА НАЛИЧНОСТ</span>
            <strong>
              {lowStock}
            </strong>
          </div>

        </section>

        <section className="admin-panel">

          <div className="admin-panel-heading">
            <div>
              <span>ПОРЪЧКИ</span>

              <h2>
                Последни поръчки
              </h2>
            </div>
          </div>

          {orders.length === 0 ? (
            <p className="admin-empty">
              Все още няма поръчки.
            </p>
          ) : (
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

                  {orders.map((order) => (

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
                              {order.courier_office || "Офисът не е записан"}
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
                  ))}

                </tbody>
              </table>

            </div>
          )}

        </section>

        <section className="admin-panel">

          <div className="admin-panel-heading">

            <div>
              <span>НАЛИЧНОСТИ</span>

              <h2>
                Продукти
              </h2>
            </div>

            <Link
              href="/admin/products"
              className="admin-primary-button"
            >
              Управление на продукти
            </Link>

          </div>

          <div className="admin-table-wrap">

            <table className="admin-table">

              <thead>
                <tr>
                  <th>Продукт</th>
                  <th>SKU</th>
                  <th>Цена</th>
                  <th>Наличност</th>
                  <th>Видим</th>
                  <th>Препоръчан</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>

                {products.map(
                  (product) => (
                    <tr key={product.id}>

                      <td>
                        <strong>
                          {product.name}
                        </strong>
                      </td>

                      <td>
                        {product.sku || "—"}
                      </td>

                      <td>
                        {formatPrice(
                          product.price_cents,
                          product.currency
                        )}
                      </td>

                      <td>
                        <strong
                          className={
                            product.stock_quantity <= 3
                              ? "admin-stock-low"
                              : ""
                          }
                        >
                          {product.stock_quantity} бр.
                        </strong>
                      </td>

                      <td>
                        {product.active
                          ? "Да"
                          : "Не"}
                      </td>

                      <td>
                        {product.featured
                          ? "Да"
                          : "Не"}
                      </td>

                      <td>
                        <Link
                          href="/admin/products"
                          className="admin-table-button"
                        >
                          Редакция
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
