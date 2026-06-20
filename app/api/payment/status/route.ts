import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const revalidate = 0;

export async function GET(req: NextRequest) {
  const cardId = req.nextUrl.searchParams.get("cardId");
  if (!cardId) {
    return NextResponse.json({ error: "cardId is required" }, { status: 400 });
  }

  const db = supabaseAdmin();
  const { data: card, error } = await db
    .from("cards")
    .select("id, slug, payment_status, plan, workspace_id")
    .eq("id", cardId)
    .maybeSingle();

  if (error || !card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  return NextResponse.json({
    status: card.payment_status,
    slug: card.slug,
    plan: card.plan,
    workspaceId: card.workspace_id,
  });
}
