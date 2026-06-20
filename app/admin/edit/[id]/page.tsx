import { createServerSupabase } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";
import { notFound, redirect } from "next/navigation";
import AdminEditClient from "./AdminEditClient";
import { CardData } from "@/lib/types";

export const revalidate = 0;

export default async function AdminEditCardPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "sparajuli802@gmail.com";

  if (!user || user.email !== adminEmail) {
    redirect("/admin");
  }

  // Fetch the card using the service-role client to bypass RLS ownership checks
  const db = supabaseAdmin();
  const { data: card, error } = await db
    .from("cards")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (error || !card) {
    console.error("Admin error fetching card for edit page:", error);
    return notFound();
  }

  return <AdminEditClient initialData={card as CardData} />;
}
