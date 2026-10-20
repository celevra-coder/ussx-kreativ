"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useCart } from "@/components/shop/CartProvider";

type DeliveryMethod =
  | "econt_office"
  | "address";

type PaymentMethod =
  | "card"
  | "cash_on_delivery";

type EcontOffice = {
  id: string;
  code: string;
  name: string;
  fullAddress: string;
  city: string;
  postCode: string;
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

export default function CheckoutPage() {
  const {
    items,
    subtotalCents,
    clearCart,
  } = useCart();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>("econt_office");

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("card");

  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [address, setAddress] = useState("");

  const [selectedOffice, setSelectedOffice] =
    useState<EcontOffice | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currency = items[0]?.currency ?? "EUR";

  const locatorUrl = useMemo(() => {
    const params = new URLSearchParams({
      shopUrl:
        typeof window !== "undefined"
          ? window.location.origin
          : "http://localhost:3001",
      officeType: "office",
      lang: "bg",
    });

    if (city.trim()) {
      params.set("city", city.trim());
    }

    return `https://officelocator.econt.com/?${params.toString()}`;
  }, [city]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const office = event.data?.office;

      if (!office) return;

      const fullAddress =
        office.address?.fullAddress ?? "";

      const officeCity =
        office.address?.city?.name ?? "";

      const officePostCode =
        office.address?.city?.postCode ?? "";

      setSelectedOffice({
        id: String(office.id ?? ""),
        code: String(office.code ?? ""),
        name: String(office.name ?? ""),
        fullAddress,
        city: officeCity,
        postCode: officePostCode,
      });

      if (officeCity) {
        setCity(officeCity);
      }
    }

    window.addEventListener(
      "message",
      handleMessage
    );

    return () => {
      window.removeEventListener(
        "message",
        handleMessage
      );
    };
  }, []);

  if (items.length === 0) {
    return (
      <main className="checkout-page">
        <div className="checkout-container">

          <Link
            href="/shop"
            className="cart-back"
          >
            ← Към магазина
          </Link>

          <div className="cart-empty">
            <span>ПОРЪЧКА</span>

            <h1>
              Количката е празна.
            </h1>

            <Link
              href="/shop"
              className="cart-shop-button"
            >
              Към магазина
            </Link>
          </div>

        </div>
      </main>
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      if (
        !name.trim() ||
        !email.trim() ||
        !phone.trim()
      ) {
        throw new Error(
          "Моля, попълнете име, телефон и имейл."
        );
      }

      if (
        deliveryMethod === "econt_office" &&
        !selectedOffice
      ) {
        throw new Error(
          "Моля, изберете офис на Еконт."
        );
      }

      if (
        deliveryMethod === "address" &&
        (!city.trim() || !address.trim())
      ) {
        throw new Error(
          "Моля, попълнете град и адрес за доставка."
        );
      }

      const payload = {
        items: items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
        })),

        customer: {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
        },

        delivery: {
          method: deliveryMethod,
          courier: "econt",

          city:
            deliveryMethod === "econt_office"
              ? selectedOffice?.city ?? city.trim()
              : city.trim(),

          postcode:
            deliveryMethod === "econt_office"
              ? selectedOffice?.postCode ?? ""
              : postcode.trim(),

          office:
            deliveryMethod === "econt_office"
              ? selectedOffice?.fullAddress ?? ""
              : "",

          office_id:
            deliveryMethod === "econt_office"
              ? selectedOffice?.id ?? ""
              : "",

          office_code:
            deliveryMethod === "econt_office"
              ? selectedOffice?.code ?? ""
              : "",

          address:
            deliveryMethod === "address"
              ? address.trim()
              : "",
        },
      };

      if (paymentMethod === "card") {
        const response = await fetch(
          "/api/checkout",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ??
              "Неуспешно стартиране на плащането."
          );
        }

        window.location.href =
          data.url;

        return;
      }

      const response = await fetch(
        "/api/cod-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ??
            "Поръчката не можа да бъде създадена."
        );
      }

      clearCart();

      window.location.href =
        `/shop/order-success?order=${encodeURIComponent(
          data.order_number
        )}`;
    }
    catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Възникна грешка."
      );

      setLoading(false);
    }
  }

  return (
    <main className="checkout-page">
      <div className="checkout-container">

        <Link
          href="/shop/cart"
          className="cart-back"
        >
          ← Назад към количката
        </Link>

        <div className="checkout-heading">
          <span>
            ЗАВЪРШВАНЕ НА ПОРЪЧКАТА
          </span>

          <h1>
            Доставка и плащане
          </h1>
        </div>

        <form
          className="checkout-grid"
          onSubmit={handleSubmit}
        >
          <div className="checkout-form">

            <section className="checkout-section">
              <h2>
                1. Данни за клиента
              </h2>

              <label>
                Име и фамилия *
                <input
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  autoComplete="name"
                />
              </label>

              <label>
                Телефон *
                <input
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                  autoComplete="tel"
                />
              </label>

              <label>
                Имейл *
                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  autoComplete="email"
                />
              </label>
            </section>

            <section className="checkout-section">
              <h2>
                2. Начин на доставка
              </h2>

              <div className="checkout-options">

                <label className="checkout-option">
                  <input
                    type="radio"
                    checked={
                      deliveryMethod ===
                      "econt_office"
                    }
                    onChange={() => {
                      setDeliveryMethod(
                        "econt_office"
                      );
                    }}
                  />

                  <span>
                    <strong>
                      Еконт до офис
                    </strong>

                    Избор от официалния
                    локатор на Еконт
                  </span>
                </label>

                <label className="checkout-option">
                  <input
                    type="radio"
                    checked={
                      deliveryMethod ===
                      "address"
                    }
                    onChange={() => {
                      setDeliveryMethod(
                        "address"
                      );

                      setSelectedOffice(null);
                    }}
                  />

                  <span>
                    <strong>
                      Еконт до адрес
                    </strong>

                    Доставка до личен адрес
                  </span>
                </label>

              </div>

              {deliveryMethod ===
              "econt_office" ? (
                <>
                  <label>
                    Град
                    <input
                      value={city}
                      onChange={(e) => {
                        setCity(
                          e.target.value
                        );

                        setSelectedOffice(
                          null
                        );
                      }}
                      placeholder="Например София"
                    />
                  </label>

                  <div className="econt-locator">
                    <iframe
                      title="Econt Office Locator"
                      src={locatorUrl}
                      allow="geolocation;"
                    />
                  </div>

                  {selectedOffice && (
                    <div className="econt-selected-office">
                      <span>
                        ИЗБРАН ОФИС
                      </span>

                      <strong>
                        {selectedOffice.name}
                      </strong>

                      <p>
                        {
                          selectedOffice.fullAddress
                        }
                      </p>

                      <small>
                        Код:{" "}
                        {selectedOffice.code}
                      </small>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <label>
                    Град *
                    <input
                      value={city}
                      onChange={(e) =>
                        setCity(
                          e.target.value
                        )
                      }
                    />
                  </label>

                  <label>
                    Пощенски код
                    <input
                      value={postcode}
                      onChange={(e) =>
                        setPostcode(
                          e.target.value
                        )
                      }
                    />
                  </label>

                  <label>
                    Адрес *
                    <textarea
                      value={address}
                      onChange={(e) =>
                        setAddress(
                          e.target.value
                        )
                      }
                      placeholder="Улица, номер, вход, етаж, апартамент"
                    />
                  </label>
                </>
              )}
            </section>

            <section className="checkout-section">
              <h2>
                3. Начин на плащане
              </h2>

              <div className="checkout-options">

                <label className="checkout-option">
                  <input
                    type="radio"
                    checked={
                      paymentMethod ===
                      "card"
                    }
                    onChange={() =>
                      setPaymentMethod(
                        "card"
                      )
                    }
                  />

                  <span>
                    <strong>
                      Банкова карта
                    </strong>

                    Сигурно плащане чрез Stripe
                  </span>
                </label>

                <label className="checkout-option">
                  <input
                    type="radio"
                    checked={
                      paymentMethod ===
                      "cash_on_delivery"
                    }
                    onChange={() =>
                      setPaymentMethod(
                        "cash_on_delivery"
                      )
                    }
                  />

                  <span>
                    <strong>
                      Наложен платеж
                    </strong>

                    Плащане при получаване
                  </span>
                </label>

              </div>
            </section>

          </div>

          <aside className="checkout-summary">

            <span>
              ВАШАТА ПОРЪЧКА
            </span>

            {items.map((item) => (
              <div
                className="checkout-summary-item"
                key={item.id}
              >
                <span>
                  {item.name} ×{" "}
                  {item.quantity}
                </span>

                <strong>
                  {formatPrice(
                    item.price_cents *
                      item.quantity,
                    item.currency
                  )}
                </strong>
              </div>
            ))}

            <div className="checkout-summary-total">
              <span>
                Общо
              </span>

              <strong>
                {formatPrice(
                  subtotalCents,
                  currency
                )}
              </strong>
            </div>

            <p>
              Цената за доставка се определя
              според тарифата на Еконт.
            </p>

            {error && (
              <div className="checkout-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="checkout-submit"
            >
              {loading
                ? "Обработване..."
                : paymentMethod === "card"
                  ? "Към плащане"
                  : "Потвърди поръчката"}
            </button>

          </aside>
        </form>

      </div>
    </main>
  );
}
