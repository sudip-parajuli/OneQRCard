import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cardId = params.id;
    if (!cardId) {
      return NextResponse.json({ error: "Card ID is required" }, { status: 400 });
    }

    const db = supabaseAdmin();
    const { error } = await db.from("scans").insert({ card_id: cardId });

    if (error) {
      console.error("Error inserting scan record:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Scan analytics endpoint error:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
