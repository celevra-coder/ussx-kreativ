import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing session_id." },
        { status: 400 }
      );
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "Stripe is not configured." },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey);

    const session =
      await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json({
        ready: false,
        payment_status: session.payment_status,
      });
    }

    const supabase = createAdminClient();

    const { data: order, error } = await supabase
      .from("orders")
      .select(
        "order_number,customer_email,total_cents,currency,status,payment_status"
      )
      .eq("stripe_checkout_session_id", sessionId)
      .maybeSingle();

    if (error) {
      console.error(error);

      return NextResponse.json(
        { error: "Could not load order." },
        { status: 500 }
      );
    }

    if (!order) {
      return NextResponse.json({
        ready: false,
        payment_status: "paid",
      });
    }

    return NextResponse.json({
      ready: true,
      order,
    });
  } catch (error) {
    console.error("Order status error:", error);

    return NextResponse.json(
      { error: "Could not verify order." },
      { status: 500 }
    );
  }
}
