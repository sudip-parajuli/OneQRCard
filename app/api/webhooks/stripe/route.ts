import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock");

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  const body = await req.text();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: `Invalid signature: ${err.message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const cardId = session.metadata?.cardId;
    if (cardId) {
      const db = supabaseAdmin();

      if (session.metadata?.type === "upgrade") {
        const targetPlan = session.metadata.targetPlan;

        // Fetch current card details to increment amount_paid
        const { data: card } = await db
          .from("cards")
          .select("amount_paid, slug")
          .eq("id", cardId)
          .maybeSingle();

        const currentPaid = card?.amount_paid || 0;

        const { error } = await db
          .from("cards")
          .update({
            plan: targetPlan,
            subdomain: targetPlan === "basic" ? null : (card?.slug || null),
            amount_paid: currentPaid + (session.amount_total || 0),
          })
          .eq("id", cardId);

        if (error) {
          console.error("Error upgrading card via Stripe webhook:", cardId, error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
      } else {
        // Regular initial card payment
        const { error } = await db
          .from("cards")
          .update({
            payment_status: "paid",
            amount_paid: session.amount_total,
          })
          .eq("id", cardId);

        if (error) {
          console.error("Error updating payment status for card:", cardId, error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
