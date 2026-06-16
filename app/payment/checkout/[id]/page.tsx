import { supabaseAdmin } from "@/lib/supabase";
import { notFound, redirect } from "next/navigation";
import CheckoutClient from "./CheckoutClient";
import { CardData } from "@/lib/types";

export const revalidate = 0;

export default async function CheckoutPage({ params }: { params: { id: string } }) {
  const db = supabaseAdmin();
  const { data: card, error } = await db
    .from("cards")
    .select("id, business_name, plan, email, owner_email, slug, payment_status")
    .eq("id", params.id)
    .maybeSingle();

  if (error || !card) {
    return notFound();
  }

  // If already paid, redirect straight to user dashboard
  if (card.payment_status === "paid") {
    redirect("/edit/dashboard");
  }

  // If free plan, redirect to dashboard as well (should not need checkout)
  if (card.plan === "basic") {
    redirect("/edit/dashboard");
  }

  return <CheckoutClient card={card as CardData} />;
}
