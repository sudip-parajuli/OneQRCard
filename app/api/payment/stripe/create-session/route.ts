import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { PLAN_DETAILS, PlanId } from "@/lib/types";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock");

export async function POST(req: NextRequest) {
  try {
    const { cardId } = await req.json();
    if (!cardId) {
      return NextResponse.json({ error: "cardId is required" }, { status: 400 });
    }

    const db = supabaseAdmin();
    const { data: card } = await db.from("cards").select("*").eq("id", cardId).maybeSingle();
    if (!card) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const plan = card.plan as PlanId;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `https://${req.headers.get("host")}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: `${PLAN_DETAILS[plan].name} digital card — ${card.business_name}` },
          unit_amount: PLAN_DETAILS[plan].priceUSD * 100, // cents
        },
        quantity: 1,
      }],
      metadata: { cardId: card.id },
      success_url: `${baseUrl}/payment/success?provider=stripe&cardId=${card.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/payment/failure?cardId=${card.id}`,
    });

    await db.from("cards").update({
      currency: "USD",
      payment_provider: "stripe",
      stripe_session_id: session.id,
    }).eq("id", card.id);

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe session creation error:", err);
    return NextResponse.json({ error: err.message || "Failed to create session" }, { status: 500 });
  }
}
