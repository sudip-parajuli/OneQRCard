import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";

export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const adminEmail = "sparajuli802@gmail.com";
    const adminPassword = "sudip@oneqrcode12345";

    if (
      email.trim().toLowerCase() !== adminEmail.toLowerCase() ||
      password !== adminPassword
    ) {
      return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 });
    }

    const supabase = createServerSupabase();

    // 1. Try to sign in using Supabase Auth password method
    let { data, error } = await supabase.auth.signInWithPassword({ email, password });

    // 2. If the user doesn't exist in Supabase auth system yet, create them pre-confirmed
    if (error && error.message.includes("Invalid login credentials")) {
      const db = supabaseAdmin();
      
      const { error: signUpError } = await db.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (signUpError) {
        console.error("Admin user pre-creation failed:", signUpError);
        return NextResponse.json({ error: signUpError.message }, { status: 400 });
      }

      // Retry signing in now that they are pre-created
      const retry = await supabase.auth.signInWithPassword({ email, password });
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: data.user });
  } catch (err: any) {
    console.error("Admin password auth endpoint error:", err);
    return NextResponse.json({ error: "Unexpected error occurred" }, { status: 500 });
  }
}
