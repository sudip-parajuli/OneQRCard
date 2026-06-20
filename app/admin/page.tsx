import { createServerSupabase } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";
import AdminDashboard from "./AdminDashboard";
import { CardData } from "@/lib/types";
import AdminLogin from "./AdminLogin";
import Link from "next/link";

export const revalidate = 0;

export default async function AdminPage() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "sparajuli802@gmail.com";

  if (!user) {
    return <AdminLogin adminEmail={adminEmail} />;
  }

  if (user.email !== adminEmail) {
    return (
      <main className="min-h-screen bg-stone-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-red-600">Access Denied</h2>
          <p className="mt-2 text-sm text-stone-500">
            You are logged in as <span className="font-semibold">{user.email}</span>, which does not have administrator privileges.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link href="/" className="text-sm font-semibold text-stone-600 hover:text-stone-900 underline">
              Home
            </Link>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="text-sm font-semibold text-stone-600 hover:text-stone-900 underline cursor-pointer"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  // Fetch all cards in the system via service role
  const db = supabaseAdmin();
  const { data: cards, error } = await db
    .from("cards")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Admin cards query error:", error);
  }

  return <AdminDashboard initialCards={(cards || []) as CardData[]} userEmail={user.email || ""} />;
}
