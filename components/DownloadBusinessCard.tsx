"use client";

import { useEffect, useState } from "react";
import { CardData } from "@/lib/types";
import { generateBusinessCard } from "@/lib/business-card";

export default function DownloadBusinessCard({ data }: { data: CardData }) {
  const [cardImage, setCardImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    generateBusinessCard(data)
      .then((url) => {
        if (active) {
          setCardImage(url);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to generate business card image:", err);
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [data]);

  function handleDownload() {
    if (!cardImage) return;
    const a = document.createElement("a");
    a.href = cardImage;
    a.download = `${data.business_name || "business"}_card.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // Only show if the plan is Pro or Business (basic has it locked)
  if (data.plan === "basic") return null;

  if (loading) {
    return (
      <div className="bg-white border border-stone-200 rounded-2xl p-5 text-center max-w-xs w-full h-[220px] flex flex-col items-center justify-center gap-2">
        <svg className="animate-spin h-5 w-5 text-stone-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-xs text-stone-400 font-medium">Generating business card...</span>
      </div>
    );
  }

  if (!cardImage) return null;

  const brandColor = data.brand_color || "#085041";

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5 text-center max-w-xs w-full shadow-sm animate-fade-in">
      <div className="text-sm font-medium mb-3 text-stone-600">Your Business Card</div>
      
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={cardImage}
        alt="Printable business card preview"
        className="mx-auto rounded-lg border border-stone-100 shadow-sm object-contain aspect-[1.75]"
      />

      <button
        onClick={handleDownload}
        style={{ borderColor: brandColor, color: brandColor }}
        className="mt-4 w-full py-2 border rounded-xl text-xs font-semibold hover:bg-stone-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3.5 h-3.5"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Download Business Card
      </button>
    </div>
  );
}
