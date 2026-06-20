import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isCardExpired } from "@/lib/utils";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cardId = params.id;
    if (!cardId) {
      return NextResponse.json({ error: "Card ID is required" }, { status: 400 });
    }

    const body = await req.json();
    const { name, phone, message } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
    }

    const db = supabaseAdmin();

    // Fetch card details to check expiration
    const { data: card, error: cardError } = await db
      .from("cards")
      .select("plan, created_at")
      .eq("id", cardId)
      .maybeSingle();

    if (cardError || !card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    if (isCardExpired(card)) {
      return NextResponse.json(
        { error: "This card's free trial has ended. Submissions are disabled." },
        { status: 403 }
      );
    }

    const { data, error } = await db
      .from("leads")
      .insert({
        card_id: cardId,
        name,
        phone,
        message: message ?? "",
      })
      .select()
      .single();

    if (error) {
      console.error("Error inserting lead record:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // In a real-world app, this is where we would send an email to the business owner
    // using a provider like Resend or SendGrid. E.g.:
    // await sendLeadNotificationEmail(card.owner_email, { name, phone, message });

    return NextResponse.json({ success: true, lead: data });
  } catch (err: any) {
    console.error("Leads endpoint error:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
