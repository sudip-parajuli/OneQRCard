import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { CardData } from "@/lib/types";
import { SITE } from "@/lib/config";
import LiveCard from "@/components/LiveCard";
import ShareQR from "@/components/ShareQR";
import DownloadBusinessCard from "@/components/DownloadBusinessCard";
import CardMap from "@/components/CardMap";

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

  const url = `https://${SITE.domain}/card/${card.slug}`;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 gap-8 bg-stone-50">
      <LiveCard data={card} />

      <DownloadBusinessCard data={card} />

      <ShareQR data={card} url={url} />

      <CardMap data={card} />

      <a href={SITE.baseUrl} className="text-xs text-stone-400">
        Made with {SITE.name}
      </a>
    </main>
  );
}
