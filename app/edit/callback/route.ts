import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/edit/dashboard";

  if (code) {
    const supabase = createServerSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("Auth callback session exchange error:", error);
    return NextResponse.redirect(`${origin}/edit?error=${encodeURIComponent(error.message)}`);
  }

  return NextResponse.redirect(`${origin}/edit?error=No+code+provided`);
}
