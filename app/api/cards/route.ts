import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase-server";
import { CardData } from "@/lib/types";
import { slugify } from "@/lib/utils";
import { nanoid } from "nanoid";

// Creates a new card in "pending" state (before payment).
// The card only becomes publicly visible once payment_status = 'paid'
// (see /api/payment/verify).
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<CardData>;

    if (!body.business_name) {
      return NextResponse.json({ error: "business_name is required" }, { status: 400 });
    }

    // Check if creator is Admin
    const supabase = createServerSupabase();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@oneqrcard.com";
    const isAdmin = session && session.user.email === adminEmail;

    const db = supabaseAdmin();

    // Build a unique slug from the business name, appending a short
    // random suffix if it's already taken.
    const base = slugify(body.business_name);
    let slug = base;
    let attempt = 0;
    while (attempt < 5) {
      const { data: existing } = await db
        .from("cards")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (!existing) break;
      slug = `${base}-${nanoid(4).toLowerCase()}`;
      attempt++;
    }

    const record: Partial<CardData> = {
      slug,
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
      owner_email: isAdmin ? (body.owner_email || body.email || "") : (body.email || ""),
      google_review: body.google_review ?? "",
      plan: body.plan ?? "basic",
      subdomain: body.plan === "basic" ? null : slug,
      payment_status: isAdmin ? (body.payment_status || "paid") : (body.plan === "basic" ? "paid" : "pending"),
    };

    const { data, error } = await db.from("cards").insert(record).select().single();

    if (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ card: data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}

// Fetch a card by slug. Used by /card/[slug] and the subdomain middleware.
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  const db = supabaseAdmin();
  const { data, error } = await db
    .from("cards")
    .select("*")
    .eq("slug", slug)
    .eq("payment_status", "paid")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ card: data });
}
