import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";

export const revalidate = 0;

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cardId = params.id;
    if (!cardId) {
      return NextResponse.json({ error: "Card ID is required" }, { status: 400 });
    }

    // Verify session
    const supabase = createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = supabaseAdmin();

    // Verify ownership of the card
    const { data: card } = await db
      .from("cards")
      .select("owner_email")
      .eq("id", cardId)
      .maybeSingle();

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "sparajuli802@gmail.com";
    const isOwner = card.owner_email === user.email;
    const isAdmin = user.email === adminEmail;

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch leads
    const { data: leads, error: leadsErr } = await db
      .from("leads")
      .select("*")
      .eq("card_id", cardId)
      .order("created_at", { ascending: false });

    // Fetch feedback
    const { data: feedback, error: feedbackErr } = await db
      .from("feedback")
      .select("*")
      .eq("card_id", cardId)
      .order("created_at", { ascending: false });

    // Fetch booking requests
    const { data: bookings, error: bookingsErr } = await db
      .from("booking_requests")
      .select("*")
      .eq("card_id", cardId)
      .order("created_at", { ascending: false });

    if (leadsErr || feedbackErr || bookingsErr) {
      console.error("Failed to query inbox data:", { leadsErr, feedbackErr, bookingsErr });
      return NextResponse.json({ error: "Failed to load inbox data" }, { status: 500 });
    }

    return NextResponse.json({
      leads: leads || [],
      feedback: feedback || [],
      bookings: bookings || [],
    });
  } catch (err: any) {
    console.error("Inbox GET handler error:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
