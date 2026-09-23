"use client";

import { FormEvent, useState } from "react";

type Status = "idle" | "sending" | "success" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);

    setStatus("sending");
    setMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.get("name"),
          phone: data.get("phone"),
          email: data.get("email"),
          city: data.get("city"),
          interest: data.get("interest"),
          area: data.get("area"),
          finish: data.get("finish"),
          message: data.get("message"),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Възникна грешка при изпращането.");
      }

      form.reset();
      setStatus("success");
      setMessage(
        "Запитването е изпратено успешно. Ще се свържем с вас за уточняване на детайлите."
      );
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Възникна грешка при изпращането."
      );
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <input
        name="name"
        type="text"
        placeholder="Име"
        autoComplete="name"
        required
      />

      <input
        name="phone"
        type="tel"
        placeholder="Телефон"
        autoComplete="tel"
        required
      />

      <input
        name="email"
        type="email"
        placeholder="Имейл"
        autoComplete="email"
        required
      />

      <input
        name="city"
        type="text"
        placeholder="Град"
        autoComplete="address-level2"
        required
      />

      <select name="interest" defaultValue="" required>
        <option value="" disabled>
          Интересувам се от...
        </option>
        <option value="Стенна облицовка">
          Стенна облицовка
        </option>
        <option value="Акустично решение">
          Акустично решение
        </option>
        <option value="Мостри">
          Мостри
        </option>
        <option value="Индивидуално решение">
          Индивидуално решение
        </option>
        <option value="Друго">
          Друго
        </option>
      </select>

      <input
        name="area"
        type="text"
        placeholder="Приблизителна площ в m²"
      />

      <input
        name="finish"
        type="text"
        placeholder="Предпочитан цвят / текстура"
      />

      <textarea
        name="message"
        placeholder="Допълнителна информация или конкретно запитване"
      />

      <button type="submit" disabled={status === "sending"}>
        {status === "sending"
          ? "Изпращане..."
          : "Изпрати запитване за текстилни тухли"}
      </button>

      {message && (
        <p
          className={`form-status ${
            status === "success" ? "form-success" : "form-error"
          }`}
          role="status"
        >
          {message}
        </p>
      )}
    </form>
  );
}
