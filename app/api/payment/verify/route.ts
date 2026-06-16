import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Verifies a completed eSewa transaction via eSewa's status check API,
 * then marks the card as paid (and therefore live/public).
 *
 * GET /api/payment/verify?cardId=...&total_amount=...&transaction_uuid=...
 */
export async function GET(req: NextRequest) {
  const cardId = req.nextUrl.searchParams.get("cardId");
  const totalAmount = req.nextUrl.searchParams.get("total_amount");
  const transactionUuid = req.nextUrl.searchParams.get("transaction_uuid");

  if (!cardId || !totalAmount || !transactionUuid) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const merchantCode = process.env.ESEWA_MERCHANT_CODE ?? "EPAYTEST";
  const statusUrl =
    process.env.ESEWA_STATUS_URL ??
    "https://rc.esewa.com.np/api/epay/transaction/status/"; // sandbox; switch to prod URL when live

  const params = new URLSearchParams({
    product_code: merchantCode,
    total_amount: totalAmount,
    transaction_uuid: transactionUuid,
  });

  try {
    const res = await fetch(`${statusUrl}?${params.toString()}`);
    const status = await res.json();

    if (status.status !== "COMPLETE") {
      return NextResponse.json({ verified: false, status }, { status: 200 });
    }

    const isUpgrade = transactionUuid.startsWith("upgrade-");
    const db = supabaseAdmin();

    let updateData: any = {};
    if (isUpgrade) {
      const parts = transactionUuid.split("-");
      const targetPlan = parts[2];

      const { data: currentCard } = await db
        .from("cards")
        .select("amount_paid, slug")
        .eq("id", cardId)
        .maybeSingle();

      const currentPaid = currentCard?.amount_paid || 0;
      const additionalPaid = Math.round(parseFloat(totalAmount) * 100);

      updateData = {
        plan: targetPlan,
        subdomain: targetPlan === "basic" ? null : (currentCard?.slug || null),
        amount_paid: currentPaid + additionalPaid,
      };
    } else {
      updateData = {
        payment_status: "paid",
        amount_paid: Math.round(parseFloat(totalAmount) * 100),
      };
    }

    const { data: card, error } = await db
      .from("cards")
      .update(updateData)
      .eq("id", cardId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ verified: true, card });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
