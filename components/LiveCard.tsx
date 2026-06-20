"use client";

import { useEffect } from "react";
import CardPreview from "@/components/CardPreview";
import { CardData } from "@/lib/types";
import { buildVCard, isCardExpired } from "@/lib/utils";
import { generateBusinessCard } from "@/lib/business-card";
import Link from "next/link";

export default function LiveCard({ data }: { data: CardData }) {
  useEffect(() => {
    if (data.id && data.plan !== "basic") {
      fetch(`/api/cards/${data.id}/scan`, { method: "POST" }).catch((e) =>
        console.error("Scan recording failed", e)
      );
    }
  }, [data.id, data.plan]);

  function handleSaveContact() {
    const vcard = buildVCard(data);
    const blob = new Blob([vcard], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.business_name || "card"}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function handleDownloadCard() {
    try {
      const dataUrl = await generateBusinessCard(data);
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${data.business_name || "business"}_card.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Failed to generate business card:", err);
      alert("Failed to generate your business card. Please try again.");
    }
  }

  if (isCardExpired(data)) {
    return (
      <div className="bg-white rounded-3xl border border-stone-200/80 p-8 max-w-sm w-full mx-auto text-center shadow-lg relative overflow-hidden animate-fade-in">
        <div className="absolute top-0 inset-x-0 h-2 bg-amber-500"></div>
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-100">
          <span className="text-2xl">⏳</span>
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-2">Free Trial Expired</h2>
        <p className="text-stone-500 text-sm mb-6 leading-relaxed">
          The 15-day free trial for <strong>{data.business_name}</strong> has ended. Upgrade to Pro or Business to reactivate this digital card.
        </p>
        <div className="flex flex-col gap-2.5">
          <Link
            href="/edit"
            className="w-full py-3 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-all shadow-sm"
          >
            Upgrade & Reactivate Card
          </Link>
          <Link
            href="/create"
            className="w-full py-3 border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-xl text-xs font-semibold transition-all"
          >
            Create a New Card
          </Link>
        </div>
      </div>
    );
  }

  const showDownload = data.plan !== "basic";

  return (
    <CardPreview
      data={data}
      onSaveContact={handleSaveContact}
      onDownloadCard={showDownload ? handleDownloadCard : undefined}
    />
  );
}
