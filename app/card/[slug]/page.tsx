import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { supabaseAdmin } from "@/lib/supabase";
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

  const url =
    card.plan === "basic"
      ? `https://${SITE.domain}/card/${card.slug}`
      : `https://${card.slug}.${SITE.domain}`;

  const qr = await QRCode.toDataURL(url, {
    width: 220,
    margin: 1,
    color: { dark: card.brand_color, light: "#ffffff" },
  });

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 gap-8 bg-stone-50">
      <LiveCard data={card} />

      <div className="bg-white border border-stone-200 rounded-2xl p-5 text-center max-w-xs w-full">
        <div className="text-sm font-medium mb-3 text-stone-600">Share this card</div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qr} alt="QR code for this card" className="mx-auto rounded-lg" />
        <div className="text-xs text-stone-400 mt-3 break-all">{url}</div>
      </div>

      <a href={SITE.baseUrl} className="text-xs text-stone-400">
        Made with {SITE.name}
      </a>
    </main>
  );
}
