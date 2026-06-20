import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import Stripe from "stripe";
import crypto from "crypto";
import { PLAN_DETAILS, PlanId } from "@/lib/types";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock");

export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabase();

    // 1. Authenticate user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { cardId, targetPlan, paymentProvider } = await req.json();

    if (!cardId || !targetPlan || !paymentProvider) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // 2. Fetch the card (RLS enforces that the user must own this card)
    const { data: card, error: cardError } = await supabase
      .from("cards")
      .select("*")
      .eq("id", cardId)
      .maybeSingle();

    if (cardError || !card) {
      return NextResponse.json({ error: "Card not found or access denied" }, { status: 404 });
    }

    const currentPlan = card.plan as PlanId;

    // Validate upgrade path
    if (currentPlan === targetPlan) {
      return NextResponse.json({ error: "Already on this plan" }, { status: 400 });
    }
    if (currentPlan === "business") {
      return NextResponse.json({ error: "Cannot upgrade from Business plan" }, { status: 400 });
    }
    if (currentPlan === "pro" && targetPlan === "basic") {
      return NextResponse.json({ error: "Downgrades are not supported" }, { status: 400 });
    }

    // Calculate price differences
    const currentPriceNPR = PLAN_DETAILS[currentPlan].priceNPR;
    const currentPriceUSD = PLAN_DETAILS[currentPlan].priceUSD;
    const targetPriceNPR = PLAN_DETAILS[targetPlan as PlanId].priceNPR;
    const targetPriceUSD = PLAN_DETAILS[targetPlan as PlanId].priceUSD;

    const amountNPR = targetPriceNPR - currentPriceNPR;
    const amountUSD = targetPriceUSD - currentPriceUSD;

    if (amountNPR <= 0 || amountUSD <= 0) {
      return NextResponse.json({ error: "Invalid pricing difference" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `https://${req.headers.get("host")}`;

    if (paymentProvider === "stripe") {
      // Create Stripe upgrade checkout session
      const stripeSession = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [{
          price_data: {
            currency: "usd",
            product_data: {
              name: `Upgrade to ${PLAN_DETAILS[targetPlan as PlanId].name} plan — ${card.business_name}`
            },
            unit_amount: amountUSD * 100, // cents
          },
          quantity: 1,
        }],
        metadata: {
          type: "upgrade",
          cardId: card.id,
          targetPlan: targetPlan,
        },
        success_url: `${baseUrl}/payment/success?provider=stripe&cardId=${card.id}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/payment/failure?cardId=${card.id}`,
      });

      // Update card with latest session info
      const adminDb = supabase; // since user is authorized, update via standard client
      await adminDb.from("cards").update({
        stripe_session_id: stripeSession.id,
      }).eq("id", card.id);

      return NextResponse.json({ url: stripeSession.url });
    } else {
      // Initiate eSewa upgrade checkout
      const merchantCode = process.env.ESEWA_MERCHANT_CODE ?? "EPAYTEST";
      const secretKey = process.env.ESEWA_SECRET_KEY ?? "8gBm/:&EnhH.1/q";
      const esewaUrl =
        process.env.ESEWA_PAYMENT_URL ??
        "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

      // Transaction UUID maps upgrade metadata: upgrade-<cardId>-<targetPlan>-<timestamp>
      const transactionUuid = `upgrade-${card.id}-${targetPlan}-${Date.now()}`;

      const message = `total_amount=${amountNPR},transaction_uuid=${transactionUuid},product_code=${merchantCode}`;
      const signature = crypto
        .createHmac("sha256", secretKey)
        .update(message)
        .digest("base64");

      const fields = {
        amount: String(amountNPR),
        tax_amount: "0",
        total_amount: String(amountNPR),
        transaction_uuid: transactionUuid,
        product_code: merchantCode,
        product_service_charge: "0",
        product_delivery_charge: "0",
        success_url: `${baseUrl}/payment/success?cardId=${card.id}`,
        failure_url: `${baseUrl}/payment/failure?cardId=${card.id}`,
        signed_field_names: "total_amount,transaction_uuid,product_code",
        signature,
      };

      return NextResponse.json({ esewaUrl, fields });
    }
  } catch (err: any) {
    console.error("Upgrade initialization error:", err);
    return NextResponse.json({ error: err.message || "Failed to initiate upgrade checkout" }, { status: 500 });
  }
}
