import Link from "next/link";

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    order?: string;
  }>;
}) {
  const params =
    await searchParams;

  return (
    <main className="checkout-result-page">
      <div className="checkout-result-card">
        <span>
          USS X KREATIV
        </span>

        <h1>
          Поръчката е приета.
        </h1>

        {params.order && (
          <div className="checkout-order-details">
            <div>
              <span>
                НОМЕР НА ПОРЪЧКА
              </span>

              <strong>
                {params.order}
              </strong>
            </div>

            <div>
              <span>
                ПЛАЩАНЕ
              </span>

              <strong>
                Наложен платеж
              </strong>
            </div>

            <div>
              <span>
                ДОСТАВКА
              </span>

              <strong>
                Еконт
              </strong>
            </div>
          </div>
        )}

        <p>
          Благодарим за поръчката.
          Плащането ще бъде извършено
          при получаване на пратката.
        </p>

        <Link href="/shop">
          Обратно към магазина
        </Link>
      </div>
    </main>
  );
}
