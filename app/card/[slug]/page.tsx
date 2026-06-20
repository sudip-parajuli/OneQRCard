import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase-server";
import { CardData } from "@/lib/types";
import { SITE } from "@/lib/config";
import LiveCard from "@/components/LiveCard";

export const revalidate = 0;

async function getCard(slug: string): Promise<CardData | null> {
  const db = supabaseAdmin();
  const { data } = await db
    .from("cards")
    .select("*")
    .eq("slug", slug)
    .eq("payment_status", "paid")
    .maybeSingle();
  return data as CardData | null;
}

export default async function CardPage({ params }: { params: { slug: string } }) {
  const card = await getCard(params.slug);
  if (!card) return notFound();

  // Check if current user is owner of the card
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = user && user.email === card.owner_email;

  const url = `https://${SITE.domain}/card/${card.slug}`;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 gap-8 bg-stone-50 pb-28 relative">
      <LiveCard data={card} />

      {/* Free Tier Ad Watermark (Phase 8) */}
      {card.plan === "basic" && (
        <div className="w-full max-w-sm mt-2 text-center p-4 bg-stone-900 text-white rounded-2xl flex items-center justify-between gap-3 shadow-md border border-stone-850 animate-fade-in">
          <div className="text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">One-QR-Card</span>
            <p className="text-xs font-semibold text-stone-100 mt-0.5">Create your own business profile</p>
          </div>
          <a
            href={SITE.baseUrl}
            className="bg-white text-stone-950 px-3.5 py-1.5 rounded-xl text-[10px] font-bold hover:bg-stone-50 transition-all shadow-sm shrink-0"
          >
            Get Started Free
          </a>
        </div>
      )}

      <div className="flex flex-col items-center gap-2 mt-4 text-center">
        <a href="/edit" className="text-xs text-stone-500 hover:text-stone-800 underline transition-colors">
          Is this your card? Edit it &rarr;
        </a>
        <a href={SITE.baseUrl} className="text-[10px] text-stone-400 hover:text-stone-600 transition-colors">
          Made with {SITE.name}
        </a>
      </div>

      {/* Owner Floating Edit Shortcut (Phase 6) */}
      {isOwner && (
        <div className="fixed bottom-6 right-6 z-50">
          <a
            href={`/edit/${card.id}`}
            className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs px-4 py-3.5 rounded-full shadow-lg border border-stone-850 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            ✏️ Edit Card Details
          </a>
        </div>
      )}
    </main>
  );
}
