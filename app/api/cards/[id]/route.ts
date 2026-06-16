import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export const revalidate = 0;

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabase();

    // Verify authentication session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Execute update using user's client, which forces Row Level Security
    const { data, error } = await supabase
      .from("cards")
      .update({
        business_name: body.business_name,
        tagline: body.tagline ?? "",
        brand_color: body.brand_color ?? "#085041",
        theme: body.theme ?? "classic",
        logo_data_url: body.logo_data_url ?? null,
        phone: body.phone ?? "",
        whatsapp: body.whatsapp ?? "",
        website: body.website ?? "",
        facebook: body.facebook ?? "",
        instagram: body.instagram ?? "",
        tiktok: body.tiktok ?? "",
        youtube: body.youtube ?? "",
        email: body.email ?? "",
        google_review: body.google_review ?? "",
        background_data_url: body.background_data_url ?? null,
        card_layout: body.card_layout ?? "classic",
        // payment_status, slug, subdomain, plan, owner_email are excluded to protect system integrity
      })
      .eq("id", params.id)
      .select()
      .maybeSingle();

    if (error) {
      console.error("PUT card update error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data) {
      // If RLS blocks or ID is not found, return 403 Forbidden
      return NextResponse.json(
        { error: "Forbidden or card not found" },
        { status: 403 }
      );
    }

    return NextResponse.json({ card: data });
  } catch (err: any) {
    console.error("PUT card handler error:", err);
    return NextResponse.json({ error: "Unexpected error occurred" }, { status: 500 });
  }
}
