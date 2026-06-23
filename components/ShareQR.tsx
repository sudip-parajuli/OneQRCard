"use client";

import { useEffect, useState } from "react";
import { CardData } from "@/lib/types";
import { generateQRCodeWithLogo } from "@/lib/qr-helper";
import { generateBusinessCard, generateQRFlyer } from "@/lib/business-card";

function dataURLtoFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

export default function ShareQR({ data, url }: { data: CardData; url: string }) {
  const [qr, setQr] = useState<string | null>(null);
  const [businessCard, setBusinessCard] = useState<string | null>(null);
  const [flyer, setFlyer] = useState<string | null>(null);
  
  const [loadingBC, setLoadingBC] = useState(false);
  const [loadingFlyer, setLoadingFlyer] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const brandColor = data.brand_color || "#085041";
  const isPaid = data.plan !== "basic";

  // 1. Generate QR Code
  useEffect(() => {
    if (!url) return;
    generateQRCodeWithLogo(
      url,
      brandColor,
      data.logo_data_url,
      data.business_name,
      isPaid && data.qr_customization?.logoEnabled !== false,
      data.qr_customization
    )
      .then(setQr)
      .catch((err) => {
        console.error("Failed to generate share QR code:", err);
      });
  }, [url, data, brandColor, isPaid]);

  // 2. Generate Business Card & Flyer
  useEffect(() => {
    if (!isPaid) return;

    setLoadingBC(true);
    generateBusinessCard(data)
      .then((img) => {
        setBusinessCard(img);
        setLoadingBC(false);
      })
      .catch((err) => {
        console.error("Failed to generate business card:", err);
        setLoadingBC(false);
      });

    setLoadingFlyer(true);
    generateQRFlyer(data)
      .then((img) => {
        setFlyer(img);
        setLoadingFlyer(false);
      })
      .catch((err) => {
        console.error("Failed to generate stand flyer:", err);
        setLoadingFlyer(false);
      });
  }, [data, isPaid]);

  function triggerStatus(msg: string) {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  }

  function handleCopy() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    triggerStatus("Copied to clipboard!");
  }

  async function handleShareLink() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: data.business_name || "Digital Card",
          text: `Check out the digital QR card for ${data.business_name || "us"}!`,
          url: url,
        });
        triggerStatus("Link shared!");
      } else {
        handleCopy();
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Error sharing link:", err);
        handleCopy();
      }
    }
  }

  function downloadFile(dataUrl: string, filename: string) {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function handleDownloadQR() {
    if (!qr) return;
    downloadFile(qr, `${data.business_name || "card"}_qr_code.png`);
  }

  function handleDownloadBC() {
    if (!businessCard) return;
    downloadFile(businessCard, `${data.business_name || "business"}_card.png`);
  }

  function handleDownloadFlyer() {
    if (!flyer) return;
    downloadFile(flyer, `${data.business_name || "google_review"}_stand_flyer.png`);
  }

  async function handleShareFile(dataUrl: string | null, filename: string, fallbackDownload: () => void) {
    if (!dataUrl) return;
    try {
      const file = dataURLtoFile(dataUrl, filename);
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: data.business_name || "Digital Card Resource",
          text: `Scan to connect with ${data.business_name || "us"}!`
        });
        triggerStatus("Shared successfully!");
      } else {
        fallbackDownload();
        triggerStatus("Sharing not supported — downloaded instead");
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Error sharing file:", err);
        fallbackDownload();
        triggerStatus("Error sharing — downloaded instead");
      }
    }
  }

  if (!data.slug) {
    return (
      <div className="bg-white border border-stone-200 rounded-2xl p-6 text-center max-w-xs w-full shadow-sm animate-fade-in flex flex-col items-center justify-center min-h-[180px]">
        <span className="text-2xl mb-2">🔗</span>
        <div className="text-xs font-semibold text-stone-600">Custom link not set</div>
        <p className="text-[10px] text-stone-450 mt-1 max-w-[200px] leading-normal">
          Set a unique profile link in the details step to generate your branded resources.
        </p>
      </div>
    );
  }

  if (!qr) {
    return (
      <div className="bg-white border border-stone-200 rounded-3xl p-6 text-center max-w-xs w-full h-44 flex items-center justify-center">
        <svg className="animate-spin h-5 w-5 text-stone-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-5 animate-fade-in text-left">
      {/* Toast status alert */}
      {statusMessage && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-stone-900 text-white text-[11px] font-bold px-4 py-2 rounded-full shadow-md transition-all animate-bounce">
          {statusMessage}
        </div>
      )}

      {/* 1. Direct Link Card */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs w-full">
        <div className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">Direct Profile Link</div>
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
          <span className="font-mono text-stone-700 truncate select-all">{url}</span>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopy}
              className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-bold text-[10px] cursor-pointer transition-colors shadow-xs"
            >
              {copied ? "✓ Copied" : "📋 Copy"}
            </button>
            <button
              type="button"
              onClick={handleShareLink}
              style={{ backgroundColor: brandColor }}
              className="px-2.5 py-1.5 text-white rounded-lg font-bold text-[10px] cursor-pointer hover:opacity-90 transition-opacity shadow-xs"
            >
              📤 Share
            </button>
          </div>
        </div>
      </div>

      {/* 2. QR Code Card */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 text-center shadow-xs flex flex-col items-center w-full">
        <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">Your Branded QR Code</div>
        <img
          src={qr}
          alt="Branded QR Code"
          className="w-36 h-36 object-contain rounded-xl border border-stone-100 shadow-sm"
        />
        <div className="grid grid-cols-2 gap-3 w-full mt-4">
          <button
            type="button"
            onClick={handleDownloadQR}
            style={{ borderColor: brandColor, color: brandColor }}
            className="py-2 border rounded-xl text-[10px] font-bold hover:bg-stone-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs bg-white"
          >
            💾 Download PNG
          </button>
          <button
            type="button"
            onClick={() => handleShareFile(qr, `${data.business_name || "card"}_qr_code.png`, handleDownloadQR)}
            style={{ backgroundColor: brandColor }}
            className="py-2 text-white rounded-xl text-[10px] font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            📤 Share QR
          </button>
        </div>
      </div>

      {/* 3. Printable Business Card */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 text-center shadow-xs flex flex-col items-center w-full relative overflow-hidden">
        <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">Printable Business Card</div>
        
        {!isPaid ? (
          <div className="w-full min-h-[140px] flex flex-col items-center justify-center bg-stone-50 border border-dashed border-stone-200 rounded-xl p-4">
            <span className="text-xl mb-1.5">🔒</span>
            <div className="text-[10px] font-bold text-stone-700">Locked on Free Plan</div>
            <p className="text-[9px] text-stone-400 mt-1 max-w-[200px] leading-normal">
              Upgrade to Pro or Business to download and share your printable business card.
            </p>
          </div>
        ) : loadingBC ? (
          <div className="w-full min-h-[140px] flex flex-col items-center justify-center">
            <svg className="animate-spin h-5 w-5 text-stone-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-[9px] text-stone-400 mt-2 font-semibold">Generating...</span>
          </div>
        ) : businessCard ? (
          <>
            <img
              src={businessCard}
              alt="Business Card Front"
              className="w-full max-w-[240px] object-contain rounded-lg border border-stone-100 shadow-sm aspect-[1.75]"
            />
            <div className="grid grid-cols-2 gap-3 w-full mt-4">
              <button
                type="button"
                onClick={handleDownloadBC}
                style={{ borderColor: brandColor, color: brandColor }}
                className="py-2 border rounded-xl text-[10px] font-bold hover:bg-stone-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs bg-white"
              >
                💾 Download PNG
              </button>
              <button
                type="button"
                onClick={() => handleShareFile(businessCard, `${data.business_name || "business"}_card.png`, handleDownloadBC)}
                style={{ backgroundColor: brandColor }}
                className="py-2 text-white rounded-xl text-[10px] font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                📤 Share Card
              </button>
            </div>
          </>
        ) : (
          <div className="text-[10px] text-stone-400">Failed to load preview</div>
        )}
      </div>

      {/* 4. Google Review A6 Stand Flyer */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 text-center shadow-xs flex flex-col items-center w-full relative overflow-hidden">
        <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">A6 Stand Flyer</div>
        <div className="text-[9px] text-stone-400 font-medium mb-3">Google Review Acrylic Stand Card</div>

        {!isPaid ? (
          <div className="w-full min-h-[140px] flex flex-col items-center justify-center bg-stone-50 border border-dashed border-stone-200 rounded-xl p-4">
            <span className="text-xl mb-1.5">🔒</span>
            <div className="text-[10px] font-bold text-stone-700">Locked on Free Plan</div>
            <p className="text-[9px] text-stone-400 mt-1 max-w-[200px] leading-normal">
              Upgrade to Pro or Business to download and share your Google Review standee flyer.
            </p>
          </div>
        ) : loadingFlyer ? (
          <div className="w-full min-h-[180px] flex flex-col items-center justify-center">
            <svg className="animate-spin h-5 w-5 text-stone-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-[9px] text-stone-400 mt-2 font-semibold">Generating flyer...</span>
          </div>
        ) : flyer ? (
          <>
            <img
              src={flyer}
              alt="A6 Stand Flyer"
              className="w-[130px] object-contain rounded-lg border border-stone-250 shadow-sm aspect-[1/1.414]"
            />
            <div className="grid grid-cols-2 gap-3 w-full mt-4">
              <button
                type="button"
                onClick={handleDownloadFlyer}
                style={{ borderColor: brandColor, color: brandColor }}
                className="py-2 border rounded-xl text-[10px] font-bold hover:bg-stone-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs bg-white"
              >
                💾 Download PNG
              </button>
              <button
                type="button"
                onClick={() => handleShareFile(flyer, `${data.business_name || "google_review"}_stand_flyer.png`, handleDownloadFlyer)}
                style={{ backgroundColor: brandColor }}
                className="py-2 text-white rounded-xl text-[10px] font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                📤 Share Flyer
              </button>
            </div>
          </>
        ) : (
          <div className="text-[10px] text-stone-400">Failed to load preview</div>
        )}
      </div>
    </div>
  );
}
