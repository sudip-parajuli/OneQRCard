import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase";
import { PLAN_DETAILS, PlanId } from "@/lib/types";

/**
 * Initiates a one-time eSewa ePay v2 payment for a card.
 *
 * eSewa requires an HMAC-SHA256 signature over:
 *   "total_amount=<amount>,transaction_uuid=<uuid>,product_code=<code>"
 * signed with your merchant secret key, base64-encoded.
 *
 * Test credentials (eSewa sandbox):
 *   merchant code: EPAYTEST
 *   secret key:    8gBm/:&EnhH.1/q
 * Replace ESEWA_MERCHANT_CODE / ESEWA_SECRET_KEY in your env with your
 * real merchant credentials once you've registered with eSewa.
 */
export async function POST(req: NextRequest) {
  const { cardId } = await req.json();
  if (!cardId) {
    return NextResponse.json({ error: "cardId is required" }, { status: 400 });
  }

  const db = supabaseAdmin();
  const { data: card, error } = await db
    .from("cards")
    .select("*")
    .eq("id", cardId)
    .maybeSingle();

  if (error || !card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  const plan = (card.plan ?? "basic") as PlanId;
  const amount = PLAN_DETAILS[plan].priceNPR;

  const merchantCode = process.env.ESEWA_MERCHANT_CODE ?? "EPAYTEST";
  const secretKey = process.env.ESEWA_SECRET_KEY ?? "8gBm/:&EnhH.1/q";
  const esewaUrl =
    process.env.ESEWA_PAYMENT_URL ??
    "https://rc-epay.esewa.com.np/api/epay/main/v2/form"; // sandbox URL; switch to https://epay.esewa.com.np/... for production

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? `https://${req.headers.get("host")}`;

  // transaction_uuid must be unique per attempt
  const transactionUuid = `${card.id}-${Date.now()}`;

  const message = `total_amount=${amount},transaction_uuid=${transactionUuid},product_code=${merchantCode}`;
  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(message)
    .digest("base64");

  const fields = {
    amount: String(amount),
    tax_amount: "0",
    total_amount: String(amount),
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
