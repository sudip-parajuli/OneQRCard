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
    const { rating, comments } = body;

    if (!rating || (rating !== "happy" && rating !== "unhappy")) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
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
      .from("feedback")
      .insert({
        card_id: cardId,
        rating,
        comments: comments ?? "",
      })
      .select()
      .single();

    if (error) {
      console.error("Error inserting feedback record:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, feedback: data });
  } catch (err: any) {
    console.error("Feedback endpoint error:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
