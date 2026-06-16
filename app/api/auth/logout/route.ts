import { createServerSupabase } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export const revalidate = 0;

export async function POST(req: NextRequest) {
  const supabase = createServerSupabase();
  await supabase.auth.signOut();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `https://${req.headers.get("host")}`;
  return NextResponse.redirect(`${baseUrl}/edit`, { status: 303 });
}
