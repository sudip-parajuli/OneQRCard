import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const revalidate = 0;

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cardId = params.id;
    const db = supabaseAdmin();
    
    // Check if card exists and plan is not basic
    const { data: card } = await db
      .from("cards")
      .select("plan")
      .eq("id", cardId)
      .maybeSingle();

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    if (card.plan === "basic") {
      return NextResponse.json({ error: "Scan analytics are not available on the Basic plan" }, { status: 403 });
    }

    // Query scans in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const { data: scans, error } = await db
      .from("scans")
      .select("scanned_at")
      .eq("card_id", cardId)
      .gte("scanned_at", sevenDaysAgo.toISOString());

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Process scans into daily counts for the last 7 days
    const counts = new Array(7).fill(0);
    const dayLabels = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      dayLabels.push(d.toLocaleDateString("en-US", { weekday: "short" }));
      
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      if (scans) {
        counts[6 - i] = scans.filter((s) => {
          const scanDate = new Date(s.scanned_at);
          return scanDate >= dayStart && scanDate <= dayEnd;
        }).length;
      }
    }

    const totalScans = scans ? scans.length : 0;

    return NextResponse.json({
      total: totalScans,
      sparkline: counts,
      labels: dayLabels,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
