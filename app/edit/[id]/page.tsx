import { createServerSupabase } from "@/lib/supabase-server";
import { notFound, redirect } from "next/navigation";
import EditClient from "./EditClient";
import { CardData } from "@/lib/types";

export const revalidate = 0;

export default async function EditCardPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/edit");
  }

  // Fetch the card using the user-bound Supabase client (RLS enforces ownership)
  const { data: card, error } = await supabase
    .from("cards")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (error || !card) {
    console.error("Error fetching card for edit page:", error);
    return notFound();
  }

  return <EditClient initialData={card as CardData} />;
}
