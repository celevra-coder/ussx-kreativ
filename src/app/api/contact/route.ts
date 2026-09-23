import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.CONTACT_TO;
    const from = process.env.RESEND_FROM;

    if (!apiKey || !to) {
      return NextResponse.json(
        { error: "Формата все още не е конфигурирана." },
        { status: 503 }
      );
    }

    if (!from) {
      return NextResponse.json(
        {
          error:
            "Формата е готова, но изпращането ще бъде активирано след свързване на домейна на USS X KREATIV.",
        },
        { status: 503 }
      );
    }

    const body = await request.json();

    const name = String(body?.name || "").trim();
    const phone = String(body?.phone || "").trim();
    const email = String(body?.email || "").trim();
    const city = String(body?.city || "").trim();
    const interest = String(body?.interest || "").trim();
    const area = String(body?.area || "").trim();
    const finish = String(body?.finish || "").trim();
    const message = String(body?.message || "").trim();

    if (!name || !phone || !email || !city || !interest) {
      return NextResponse.json(
        { error: "Моля, попълнете задължителните полета." },
        { status: 400 }
      );
    }

    if (
      name.length > 120 ||
      phone.length > 50 ||
      email.length > 200 ||
      city.length > 150 ||
      interest.length > 150 ||
      area.length > 100 ||
      finish.length > 300 ||
      message.length > 5000
    ) {
      return NextResponse.json(
        { error: "Въведената информация е прекалено дълга." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Моля, въведете валиден имейл адрес." },
        { status: 400 }
      );
    }

    const resend = new Resend(apiKey);

    const result = await resend.emails.send({
      from,
      to: [to],
      replyTo: email,
      subject: `Запитване за текстилни тухли — ${name}`,
      text: [
        "Ново запитване от сайта USS X KREATIV",
        "",
        `Име: ${name}`,
        `Телефон: ${phone}`,
        `Имейл: ${email}`,
        `Град: ${city}`,
        "",
        `Интерес: ${interest}`,
        `Приблизителна площ: ${area || "Не е посочена"}`,
        `Цвят / текстура: ${finish || "Не е посочено"}`,
        "",
        "Допълнителна информация:",
        message || "Няма допълнителна информация.",
      ].join("\n"),
    });

    if (result.error) {
      console.error("Resend error:", result.error);

      return NextResponse.json(
        { error: "Запитването не можа да бъде изпратено. Опитайте отново." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact API error:", error);

    return NextResponse.json(
      { error: "Възникна грешка при изпращането." },
      { status: 500 }
    );
  }
}
