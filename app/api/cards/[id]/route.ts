import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";

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

    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "sparajuli802@gmail.com";
    const isAdmin = session.user.email === adminEmail;

    const body = await req.json();

    const updatePayload: any = {
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
      text_color: body.text_color ?? null,
      member_name: body.member_name ?? null,
      member_role: body.member_role ?? null,
      show_logo_on_card: body.show_logo_on_card !== undefined ? body.show_logo_on_card : true,
    };

    if (isAdmin) {
      if (body.plan !== undefined) {
        updatePayload.plan = body.plan;
        if (body.plan === "basic") {
          updatePayload.subdomain = null;
        } else if (body.slug) {
          updatePayload.subdomain = body.slug;
        }
      }
      if (body.payment_status !== undefined) {
        updatePayload.payment_status = body.payment_status;
      }
      if (body.owner_email !== undefined) {
        updatePayload.owner_email = body.owner_email;
      }
    }

    // Admin updates bypass RLS via service role
    const dbClient = isAdmin ? supabaseAdmin() : supabase;

    const { data, error } = await dbClient
      .from("cards")
      .update(updatePayload)
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabase();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "sparajuli802@gmail.com";
    if (session.user.email !== adminEmail) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const db = supabaseAdmin();
    const { error } = await db
      .from("cards")
      .delete()
      .eq("id", params.id);

    if (error) {
      console.error("DELETE card error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE card handler error:", err);
    return NextResponse.json({ error: "Unexpected error occurred" }, { status: 500 });
  }
}
