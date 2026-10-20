"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const labels: Record<string, string> = {
  pending: "Чакаща",
  paid: "Платена",
  processing: "Обработва се",
  shipped: "Изпратена",
  completed: "Завършена",
  cancelled: "Отказана",
  refunded: "Възстановена",
};

export default function OrderStatusControl({
  orderId,
  initialStatus,
}: {
  orderId: string;
  initialStatus: string;
}) {
  const router = useRouter();

  const [status, setStatus] =
    useState(initialStatus);

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  async function save() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/orders/${orderId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
          "Грешка при запис."
        );
      }

      setMessage(
        "Статусът е обновен."
      );

      router.refresh();
    }
    catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Възникна грешка."
      );
    }
    finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-order-status-box">
      <label>
        Статус на поръчката

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
        >
          {Object.entries(labels).map(
            ([value, label]) => (
              <option
                key={value}
                value={value}
              >
                {label}
              </option>
            )
          )}
        </select>
      </label>

      <button
        type="button"
        onClick={save}
        disabled={loading}
      >
        {loading
          ? "Записване..."
          : "Запази статуса"}
      </button>

      {message && (
        <small>{message}</small>
      )}
    </div>
  );
}
