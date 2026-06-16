"use client";

import { useEffect, useState } from "react";
import { CardData } from "@/lib/types";
import { generateQRCodeWithLogo } from "@/lib/qr-helper";

export default function ShareQR({ data, url }: { data: CardData; url: string }) {
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    const isBusiness = data.plan === "business";
    generateQRCodeWithLogo(
      url,
      data.brand_color || "#085041",
      data.logo_data_url,
      data.business_name,
      isBusiness
    )
      .then(setQr)
      .catch((err) => {
        console.error("Failed to generate share QR code:", err);
      });
  }, [url, data]);

  if (!qr) {
    return (
      <div className="bg-white border border-stone-200 rounded-2xl p-5 text-center max-w-xs w-full h-44 flex items-center justify-center">
        <svg className="animate-spin h-5 w-5 text-stone-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5 text-center max-w-xs w-full shadow-sm animate-fade-in">
      <div className="text-sm font-medium mb-3 text-stone-600">Share this card</div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={qr} alt="QR code for this card" className="mx-auto rounded-lg border border-stone-100 shadow-sm" />
      <div className="text-xs text-stone-400 mt-3 break-all font-mono select-all">{url}</div>
    </div>
  );
}
