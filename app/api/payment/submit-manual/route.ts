import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const { cardId, txn_id, sender_wallet } = await req.json();

    if (!cardId || !txn_id || !sender_wallet) {
      return NextResponse.json(
        { error: "Card ID, Transaction ID, and Sender details are required." },
        { status: 400 }
      );
    }

    const db = supabaseAdmin();

    // Verify card exists
    const { data: card, error: fetchError } = await db
      .from("cards")
      .select("*")
      .eq("id", cardId)
      .maybeSingle();

    if (fetchError || !card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    // Update the card payment status and transaction details
    const { error: updateError } = await db
      .from("cards")
      .update({
        payment_status: "pending_verification",
        txn_id: txn_id.trim(),
        sender_wallet: sender_wallet.trim(),
      })
      .eq("id", cardId);

    if (updateError) {
      console.error("Manual payment update error:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, slug: card.slug });
  } catch (err: any) {
    console.error("submit-manual API error:", err);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
