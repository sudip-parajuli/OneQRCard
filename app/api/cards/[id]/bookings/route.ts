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
    const { customer_name, customer_phone, preferred_datetime, service_requested } = body;

    if (!customer_name || !customer_phone || !preferred_datetime) {
      return NextResponse.json(
        { error: "Name, phone, and date/time are required" },
        { status: 400 }
      );
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
      .from("booking_requests")
      .insert({
        card_id: cardId,
        customer_name,
        customer_phone,
        preferred_datetime,
        service_requested: service_requested ?? "",
      })
      .select()
      .single();

    if (error) {
      console.error("Error inserting booking request:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, booking: data });
  } catch (err: any) {
    console.error("Bookings API handler error:", err);
    return NextResponse.json({ error: "Unexpected error occurred" }, { status: 500 });
  }
}
