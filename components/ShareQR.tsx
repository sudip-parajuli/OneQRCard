"use client";

import { useEffect, useState } from "react";
import { CardData } from "@/lib/types";
import { generateQRCodeWithLogo } from "@/lib/qr-helper";
import DownloadBusinessCard from "@/components/DownloadBusinessCard";

export default function ShareQR({ data, url }: { data: CardData; url: string }) {
  const [qr, setQr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const isPaid = data.plan !== "basic";
    generateQRCodeWithLogo(
      url,
      data.brand_color || "#085041",
      data.logo_data_url,
      data.business_name,
      isPaid,
      data.qr_customization
    )
      .then(setQr)
      .catch((err) => {
        console.error("Failed to generate share QR code:", err);
      });
  }, [url, data, data.qr_customization]);

  function handleDownloadQR() {
    if (!qr) return;
    const a = document.createElement("a");
    a.href = qr;
    a.download = `${data.business_name || "card"}_qr_code.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function handleCopy() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!data.slug) {
    return (
      <div className="bg-white border border-stone-200 rounded-xl p-5 text-center max-w-xs w-full shadow-sm animate-fade-in flex flex-col items-center justify-center min-h-[180px]">
        <span className="text-2xl mb-2">🔗</span>
        <div className="text-xs font-semibold text-stone-600">Custom link not set</div>
        <p className="text-[10px] text-stone-400 mt-1 max-w-[200px] leading-normal">
          Set a unique profile link in the details step to generate your branded QR code.
        </p>
      </div>
    );
  }

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

  const brandColor = data.brand_color || "#085041";

  return (
    <div className="w-full flex flex-col gap-4 animate-fade-in text-left">
      {/* QR Code Sharing */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 text-center shadow-sm flex flex-col items-center w-full">
        <div className="text-sm font-medium mb-3 text-stone-600">Scan or Share QR Code</div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qr} alt="QR code for this card" className="mx-auto rounded-lg border border-stone-100 shadow-sm w-36 h-36 object-contain" />
        
        <button
          type="button"
          onClick={handleDownloadQR}
          style={{ borderColor: brandColor, color: brandColor }}
          className="mt-3.5 w-full py-2 border rounded-xl text-xs font-semibold hover:bg-stone-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
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
          Download QR Code
        </button>
      </div>

      {/* Business Card Section */}
      <div className="w-full flex justify-center">
        <DownloadBusinessCard data={data} />
      </div>

      {/* Direct Link Section */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3 text-left w-full">
        <div className="flex-1 min-w-0">
          <div className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Direct Card Link</div>
          <div className="text-xs text-stone-700 font-mono truncate mt-0.5 select-all">{url}</div>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          style={{ backgroundColor: brandColor }}
          className="text-white text-xs font-semibold px-3 py-2 rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer shadow-sm"
        >
          {copied ? "✓ Copied!" : "📋 Copy"}
        </button>
      </div>
    </div>
  );
}
