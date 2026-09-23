import Link from "next/link";

export default function ShopPage() {
  return (
    <main className="shop-coming-soon">
      <div className="shop-coming-soon__inner">
        <span className="shop-coming-soon__kicker">ОНЛАЙН МАГАЗИН</span>

        <h1>
          Скоро ще можете да поръчвате
          <em> директно онлайн.</em>
        </h1>

        <p>
          В момента подготвяме продуктовите серии, наличностите
          и възможностите за поръчка на текстилните тухли USS X KREATIV.
        </p>

        <strong>Очаквайте скоро.</strong>

        <div className="shop-coming-soon__actions">
          <Link href="/">Към началната страница</Link>
          <Link href="/#contact">Изпрати запитване</Link>
        </div>
      </div>
    </main>
  );
}
