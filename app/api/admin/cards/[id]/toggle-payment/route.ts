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

    const body = await req.json();
    const status = body.payment_status;

    if (status !== "paid" && status !== "pending") {
      return NextResponse.json({ error: "Invalid payment status" }, { status: 400 });
    }

    const db = supabaseAdmin();
    const { data, error } = await db
      .from("cards")
      .update({ payment_status: status })
      .eq("id", params.id)
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    return NextResponse.json({ card: data });
  } catch (err: any) {
    console.error("Admin toggle-payment endpoint error:", err);
    return NextResponse.json({ error: "Unexpected error occurred" }, { status: 500 });
  }
}
