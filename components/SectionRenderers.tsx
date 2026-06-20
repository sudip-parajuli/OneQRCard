"use client";

import { useState } from "react";
import { MenuItem, MenuCategory, MenuSectionData, GallerySectionData, ServiceItem, ServicesSectionData } from "@/lib/sections";
import { CardData } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

// Resolve open/closed status for hours
function getOpenStatus(hours: any): { isOpen: boolean; text: string } | null {
  if (!hours) return null;
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const now = new Date();
  const currentDay = days[now.getDay()];
  const dayHours = hours[currentDay];
  
  if (!dayHours || dayHours.isClosed) {
    return { isOpen: false, text: "Closed" };
  }
  
  const [openH, openM] = dayHours.open.split(":").map(Number);
  const [closeH, closeM] = dayHours.close.split(":").map(Number);
  
  const currentH = now.getHours();
  const currentM = now.getMinutes();
  
  const openTime = openH * 60 + openM;
  const closeTime = closeH * 60 + closeM;
  const currentTime = currentH * 60 + currentM;
  
  if (currentTime >= openTime && currentTime <= closeTime) {
    return { isOpen: true, text: `Open Now (closes at ${dayHours.close})` };
  }
  return { isOpen: false, text: `Closed (opens at ${dayHours.open})` };
}

// Resolve styles dynamically based on the card's active theme
function getThemeStyles(theme: string) {
  const styles = {
    cardBg: "bg-white border border-stone-200 rounded-2xl p-5 shadow-sm",
    titleText: "text-stone-900 font-bold",
    bodyText: "text-stone-850",
    mutedText: "text-stone-500",
    itemBg: "bg-stone-50 border border-stone-150 rounded-xl p-3.5",
    buttonClass: "text-white font-semibold shadow-sm hover:opacity-95",
    tabActive: "bg-brand text-white border-brand shadow-sm",
    tabInactive: "bg-white text-stone-600 border-stone-200 hover:bg-stone-50",
    borderClass: "border-stone-100",
  };

  if (theme === "glassmorphic") {
    styles.cardBg = "bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-2xl text-white";
    styles.titleText = "text-white font-bold drop-shadow-sm";
    styles.bodyText = "text-white/90";
    styles.mutedText = "text-white/70";
    styles.itemBg = "bg-white/5 border border-white/10 rounded-xl p-3.5 hover:bg-white/10 transition-colors";
    styles.buttonClass = "bg-white/20 hover:bg-white/30 text-white border border-white/20 backdrop-blur-sm";
    styles.tabActive = "bg-white text-stone-900 font-bold border-white shadow-md";
    styles.tabInactive = "bg-white/5 text-white/80 border-white/10 hover:bg-white/10";
    styles.borderClass = "border-white/10";
  } else if (theme === "neonDark") {
    styles.cardBg = "bg-stone-900/60 backdrop-blur-md border border-stone-800 rounded-2xl p-5 shadow-lg text-white";
    styles.titleText = "text-white font-extrabold tracking-tight";
    styles.bodyText = "text-stone-200";
    styles.mutedText = "text-stone-400";
    styles.itemBg = "bg-stone-950/70 border border-stone-850 rounded-xl p-3.5 hover:border-brand/45 transition-colors";
    styles.buttonClass = "text-white border border-brand/50 hover:bg-brand/10 bg-brand/5";
    styles.tabActive = "text-brand border-brand bg-brand/10 shadow-[0_0_10px_rgba(124,58,237,0.2)] font-bold";
    styles.tabInactive = "bg-stone-950/60 text-stone-400 border-stone-850 hover:bg-stone-900";
    styles.borderClass = "border-stone-800/80";
  } else if (theme === "bold") {
    styles.cardBg = "bg-white/95 border border-stone-150 rounded-2xl p-5 shadow-md text-stone-900";
    styles.titleText = "text-stone-950 font-bold";
    styles.bodyText = "text-stone-800";
    styles.mutedText = "text-stone-500";
    styles.itemBg = "bg-stone-50 border border-stone-150/60 rounded-xl p-3.5 hover:bg-stone-100/50 transition-colors";
    styles.buttonClass = "text-white hover:opacity-90";
    styles.tabActive = "text-white font-bold"; 
    styles.tabInactive = "bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200/50";
    styles.borderClass = "border-stone-150";
  } else if (theme === "minimal") {
    styles.cardBg = "bg-white border border-stone-200 rounded-2xl p-5 shadow-sm text-stone-900";
    styles.titleText = "text-stone-900 font-semibold";
    styles.bodyText = "text-stone-850";
    styles.mutedText = "text-stone-500";
    styles.itemBg = "bg-stone-50/50 border border-stone-150 rounded-xl p-3.5 hover:bg-stone-50 transition-colors";
    styles.buttonClass = "text-white hover:opacity-95";
    styles.tabActive = "bg-stone-900 text-white border-stone-900 font-medium shadow-sm";
    styles.tabInactive = "bg-white text-stone-600 border-stone-200 hover:bg-stone-50";
    styles.borderClass = "border-stone-200";
  }

  return styles;
}

// 1. Menu Section Component
export function MenuSectionRenderer({ data, card }: { data: MenuSectionData; card: CardData }) {
  const categories = data.categories || [];
  const [selectedCatId, setSelectedCatId] = useState(categories[0]?.id || "");
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  const t = getThemeStyles(card.theme);
  const brandColor = card.brand_color || "#7c3aed";
  const activeCategory = categories.find((c) => c.id === selectedCatId) || categories[0];

  if (categories.length === 0) return null;

  return (
    <div className={t.cardBg}>
      {/* Header */}
      <h3 className={`text-base mb-4 flex items-center gap-2 ${t.titleText}`}>
        <span>🍽️</span> <span>{data.categories?.[0]?.name ? "Our Menu" : "Menu"}</span>
      </h3>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-3.5 scrollbar-none border-b mb-4" style={{ borderColor: t.borderClass }}>
        {categories.map((cat) => {
          const isActive = activeCategory?.id === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCatId(cat.id);
                setExpandedItemId(null);
              }}
              style={isActive && card.theme !== "glassmorphic" && card.theme !== "neonDark" ? { backgroundColor: brandColor, borderColor: brandColor } : {}}
              className={`px-3 py-1.5 rounded-full border text-xs font-semibold shrink-0 cursor-pointer transition-all ${
                isActive ? t.tabActive : t.tabInactive
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Items list */}
      {activeCategory ? (
        <div className="space-y-2">
          {activeCategory.items.map((item) => {
            const isExpanded = expandedItemId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                className={`cursor-pointer transition-all duration-150 ${t.itemBg} ${
                  item.is_sold_out ? "opacity-50" : ""
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-0.5 flex-1 pr-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-xs">{item.name}</span>
                      {item.is_popular && (
                        <span
                          style={card.theme !== "glassmorphic" && card.theme !== "neonDark" ? { backgroundColor: brandColor } : {}}
                          className="bg-brand text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider scale-95"
                        >
                          Popular
                        </span>
                      )}
                      {item.is_sold_out && (
                        <span className="bg-stone-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider scale-95">
                          Sold Out
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className={`text-[10px] line-clamp-1 ${isExpanded ? "hidden" : t.mutedText}`}>
                        {item.description}
                      </p>
                    )}
                  </div>

                  {data.show_prices !== false && (
                    <span className="font-bold text-xs shrink-0" style={{ color: card.theme === "bold" ? undefined : brandColor }}>
                      {item.price}
                    </span>
                  )}
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3.5 pt-3.5 border-t overflow-hidden space-y-3"
                      style={{ borderColor: t.borderClass }}
                    >
                      {item.description && (
                        <p className={`text-[11px] leading-relaxed ${t.bodyText}`}>
                          {item.description}
                        </p>
                      )}
                      {item.photo_data_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.photo_data_url}
                          alt={item.name}
                          className="w-full h-36 object-cover rounded-xl border"
                          style={{ borderColor: t.borderClass }}
                        />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      ) : (
        <p className={`text-center text-xs py-4 ${t.mutedText}`}>No items configured.</p>
      )}

      {/* Order Call to Action button */}
      {data.order_cta && data.order_cta !== "none" && (
        <div className="mt-4">
          <a
            href={
              data.order_cta === "call"
                ? `tel:${card.phone}`
                : `https://wa.me/${card.whatsapp}?text=Hello!%20I%20would%20like%20to%20order%20from%20your%20menu.`
            }
            target="_blank"
            rel="noopener noreferrer"
            style={card.theme !== "glassmorphic" && card.theme !== "neonDark" ? { backgroundColor: brandColor } : {}}
            className={`w-full py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-opacity cursor-pointer ${t.buttonClass}`}
          >
            {data.order_cta === "call" ? (
              <>
                <span>📞</span> <span>Call to Place Order</span>
              </>
            ) : (
              <>
                <span>💬</span> <span>WhatsApp Order</span>
              </>
            )}
          </a>
        </div>
      )}
    </div>
  );
}

// 2. Gallery Section Component
export function GallerySectionRenderer({ data, card }: { data: GallerySectionData; card: CardData }) {
  const images = data.images || [];
  const layout = data.layout || "grid";
  const [activeImgIdx, setActiveImgIdx] = useState<number | null>(null);

  const t = getThemeStyles(card.theme);

  if (images.length === 0) return null;

  return (
    <div className={t.cardBg}>
      <h3 className={`text-base mb-4 flex items-center gap-2 ${t.titleText}`}>
        <span>🎨</span> <span>Portfolio / Gallery</span>
      </h3>

      {/* Rendering Layouts */}
      {layout === "grid" ? (
        <div className="grid grid-cols-2 gap-3">
          {images.map((img, idx) => (
            <div
              key={img.id}
              onClick={() => setActiveImgIdx(idx)}
              className="relative aspect-square rounded-xl overflow-hidden cursor-pointer border hover:opacity-95 transition-opacity"
              style={{ borderColor: t.borderClass }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.data_url} alt={img.caption || "Gallery"} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory">
          {images.map((img, idx) => (
            <div
              key={img.id}
              onClick={() => setActiveImgIdx(idx)}
              className="relative shrink-0 w-32 aspect-square rounded-xl overflow-hidden cursor-pointer border hover:opacity-95 transition-opacity snap-center"
              style={{ borderColor: t.borderClass }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.data_url} alt={img.caption || "Gallery"} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {activeImgIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col justify-between p-4"
          >
            {/* Top Close Bar */}
            <header className="flex justify-end p-2">
              <button
                onClick={() => setActiveImgIdx(null)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-sm cursor-pointer shadow"
              >
                ✕
              </button>
            </header>

            {/* Mid Image Panel */}
            <div className="flex-1 flex items-center justify-center relative">
              {/* Prev Arrow */}
              {activeImgIdx > 0 && (
                <button
                  onClick={() => setActiveImgIdx(activeImgIdx - 1)}
                  className="absolute left-2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-lg font-bold cursor-pointer"
                >
                  ‹
                </button>
              )}

              {/* Main Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[activeImgIdx].data_url}
                alt={images[activeImgIdx].caption || "Fullscreen"}
                className="max-h-[70vh] max-w-full object-contain rounded"
              />

              {/* Next Arrow */}
              {activeImgIdx < images.length - 1 && (
                <button
                  onClick={() => setActiveImgIdx(activeImgIdx + 1)}
                  className="absolute right-2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-lg font-bold cursor-pointer"
                >
                  ›
                </button>
              )}
            </div>

            {/* Bottom Caption */}
            <footer className="text-center text-white py-4 max-w-lg mx-auto">
              <p className="text-sm font-semibold tracking-wide">
                {images[activeImgIdx].caption || "Image Detail"}
              </p>
              <p className="text-[10px] text-zinc-400 mt-1">
                {activeImgIdx + 1} of {images.length}
              </p>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 3. Services Section Component
export function ServicesSectionRenderer({ data, card }: { data: ServicesSectionData; card: CardData }) {
  const services = data.services || [];
  const t = getThemeStyles(card.theme);
  const brandColor = card.brand_color || "#7c3aed";

  if (services.length === 0) return null;

  return (
    <div className={t.cardBg}>
      <h3 className={`text-base mb-4 flex items-center gap-2 ${t.titleText}`}>
        <span>✂️</span> <span>Our Services</span>
      </h3>

      <div className="space-y-3">
        {services.map((srv) => (
          <div key={srv.id} className={`${t.itemBg} relative group flex flex-col gap-1.5`}>
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-xs">{srv.name}</span>
                  {srv.is_popular && (
                    <span
                      style={card.theme !== "glassmorphic" && card.theme !== "neonDark" ? { backgroundColor: brandColor } : {}}
                      className="bg-brand text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider"
                    >
                      Popular
                    </span>
                  )}
                </div>
                {srv.duration && (
                  <span className={`text-[10px] font-medium block ${t.mutedText}`}>
                    ⏱️ {srv.duration}
                  </span>
                )}
              </div>

              {srv.price && (
                <span className="font-bold text-xs shrink-0 font-mono" style={{ color: card.theme === "bold" ? undefined : brandColor }}>
                  {srv.price}
                </span>
              )}
            </div>

            {srv.description && (
              <p className={`text-[11px] leading-relaxed mt-0.5 ${t.bodyText}`}>
                {srv.description}
              </p>
            )}

            {/* Booking URL CTA */}
            {srv.booking_url && (
              <div className="mt-2 flex justify-end">
                <a
                  href={srv.booking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={card.theme !== "glassmorphic" && card.theme !== "neonDark" ? { backgroundColor: brandColor } : {}}
                  className={`text-[10px] px-3 py-1.5 rounded-lg text-center cursor-pointer transition-opacity ${t.buttonClass}`}
                >
                  Book Service
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// 4. Hours Section Component
export function HoursSectionRenderer({ data, card }: { data: any; card: CardData }) {
  const t = getThemeStyles(card.theme);
  const brandColor = card.brand_color || "#7c3aed";
  const hours = card.opening_hours || data.hours || {};
  const [isOpenFull, setIsOpenFull] = useState(false);

  const status = getOpenStatus(hours);
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  return (
    <div className={t.cardBg}>
      <h3 className={`text-base mb-3 flex items-center gap-2 ${t.titleText}`}>
        <span>📅</span> <span>Opening Hours</span>
      </h3>
      {status ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${status.isOpen ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
            <span className="text-xs font-bold capitalize">{status.text}</span>
          </div>
          <button
            onClick={() => setIsOpenFull(!isOpenFull)}
            className="text-xs font-bold transition-all"
            style={{ color: brandColor }}
          >
            {isOpenFull ? "Hide Schedule" : "Show Schedule"}
          </button>
        </div>
      ) : (
        <p className={`text-xs ${t.mutedText}`}>No hours configured.</p>
      )}

      {isOpenFull && (
        <div className="mt-3.5 pt-3.5 border-t space-y-2 text-xs" style={{ borderColor: t.borderClass }}>
          {days.map((day) => {
            const h = hours[day];
            const isToday = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase() === day;
            return (
              <div key={day} className={`flex justify-between py-1 capitalize ${isToday ? "font-bold text-brand" : ""}`}>
                <span>{day}</span>
                <span className={isToday ? "" : t.mutedText}>
                  {h && !h.isClosed ? `${h.open} - ${h.close}` : "Closed"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// 5. Location Section Component
export function LocationSectionRenderer({ data, card }: { data: any; card: CardData }) {
  const t = getThemeStyles(card.theme);
  const brandColor = card.brand_color || "#7c3aed";
  const address = card.address || data.address || "";
  const mapsUrl = data.google_maps_url || "";
  const directionsUrl = card.location_url || (address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : "");

  return (
    <div className={t.cardBg}>
      <h3 className={`text-base mb-3.5 flex items-center gap-2 ${t.titleText}`}>
        <span>📍</span> <span>Our Location</span>
      </h3>
      {mapsUrl && (
        <div className="overflow-hidden rounded-xl border mb-3" style={{ borderColor: t.borderClass }}>
          <iframe
            src={mapsUrl}
            width="100%"
            height="180"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
          />
        </div>
      )}
      {address && <p className={`text-xs mb-3.5 leading-relaxed ${t.bodyText}`}>{address}</p>}
      {directionsUrl && (
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={card.theme !== "glassmorphic" && card.theme !== "neonDark" ? { backgroundColor: brandColor } : {}}
          className={`w-full py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-opacity cursor-pointer ${t.buttonClass}`}
        >
          <span>🚗</span> <span>Get Directions</span>
        </a>
      )}
    </div>
  );
}

// 6. Review Section Component (Sentiment Gated)
export function ReviewSectionRenderer({ data, card }: { data: any; card: CardData }) {
  const t = getThemeStyles(card.theme);
  const brandColor = card.brand_color || "#7c3aed";
  const googleReviewUrl = data.google_review_url || card.google_review || "";
  const [rated, setRated] = useState<"happy" | "unhappy" | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!googleReviewUrl) return null;

  if (submitted) {
    return (
      <div className={t.cardBg}>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center text-xs text-emerald-800 animate-fade-in w-full">
          Thank you for your valuable feedback! We appreciate you helping us improve.
        </div>
      </div>
    );
  }

  if (rated === "unhappy") {
    return (
      <div className={t.cardBg}>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!feedbackText.trim()) return;
            setSubmitting(true);
            try {
              await fetch(`/api/cards/${card.id}/feedback`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rating: "unhappy", comments: feedbackText }),
              });
            } catch (err) {
              console.error(err);
            }
            setSubmitting(false);
            setSubmitted(true);
          }}
          className="text-left text-xs space-y-3 animate-fade-in w-full"
        >
          <p className={`font-semibold ${t.bodyText}`}>We&apos;re sorry to hear that. How can we make it right?</p>
          <textarea
            required
            rows={3}
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Share your experience privately with us..."
            className="w-full border border-stone-300 rounded-lg p-2.5 text-xs text-stone-900 focus:ring-1 focus:ring-brand bg-white resize-none"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              style={{ backgroundColor: brandColor }}
              className="text-white px-3 py-1.5 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Submitting..." : "Submit Feedback"}
            </button>
            <button
              type="button"
              onClick={() => setRated(null)}
              className={`font-semibold px-2 py-1.5 ${t.mutedText}`}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className={t.cardBg}>
      <h3 className={`text-base mb-3 flex items-center gap-2 ${t.titleText}`}>
        <span>⭐</span> <span>Review & Rate Us</span>
      </h3>
      <p className={`text-xs mb-4 ${t.mutedText}`}>How has your experience been with us?</p>
      <div className="flex justify-center gap-10 py-2">
        <button
          type="button"
          onClick={() => {
            setRated("happy");
            window.open(googleReviewUrl, "_blank", "noopener,noreferrer");
          }}
          className="flex flex-col items-center gap-1 group"
        >
          <span className="text-3xl filter transition-transform group-hover:scale-110 duration-200">🙂</span>
          <span className={`text-[10px] font-medium ${t.bodyText}`}>Happy</span>
        </button>
        <button
          type="button"
          onClick={() => setRated("unhappy")}
          className="flex flex-col items-center gap-1 group"
        >
          <span className="text-3xl filter transition-transform group-hover:scale-110 duration-200">🙁</span>
          <span className={`text-[10px] font-medium ${t.bodyText}`}>Unhappy</span>
        </button>
      </div>
    </div>
  );
}

// 7. Booking Section Component (Link out or Request Form Mode B)
export function BookingSectionRenderer({ data, card }: { data: any; card: CardData }) {
  const t = getThemeStyles(card.theme);
  const brandColor = card.brand_color || "#7c3aed";
  const mode = data.mode || "link";
  const url = data.booking_url || "";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [datetime, setDatetime] = useState("");
  const [service, setService] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (mode === "link") {
    if (!url) return null;
    return (
      <div className={t.cardBg}>
        <h3 className={`text-base mb-3.5 flex items-center gap-2 ${t.titleText}`}>
          <span>📅</span> <span>Book Appointment</span>
        </h3>
        <p className={`text-xs mb-3.5 ${t.mutedText}`}>Schedule your visit or session online instantly.</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={card.theme !== "glassmorphic" && card.theme !== "neonDark" ? { backgroundColor: brandColor } : {}}
          className={`w-full py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-opacity cursor-pointer ${t.buttonClass}`}
        >
          <span>📅</span> <span>Book Online Now</span>
        </a>
      </div>
    );
  }

  // Built-in Request Form Mode B
  if (submitted) {
    return (
      <div className={t.cardBg}>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center text-xs text-emerald-800 animate-fade-in w-full">
          Booking request submitted successfully! Redirecting you to confirm via WhatsApp...
        </div>
      </div>
    );
  }

  return (
    <div className={t.cardBg}>
      <h3 className={`text-base mb-3 flex items-center gap-2 ${t.titleText}`}>
        <span>📅</span> <span>Request Appointment</span>
      </h3>
      <p className={`text-xs mb-4 ${t.mutedText}`}>Submit your details below to request a booking.</p>
      
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!name.trim() || !phone.trim() || !datetime.trim()) return;
          setSubmitting(true);
          try {
            await fetch(`/api/cards/${card.id}/bookings`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                customer_name: name,
                customer_phone: phone,
                preferred_datetime: datetime,
                service_requested: service,
              }),
            });
            setSubmitted(true);
            
            // Prefilled WhatsApp text
            const whatsappText = `Hello! I would like to request an appointment.\n\n👤 Name: ${name}\n📞 Phone: ${phone}\n📅 Preferred Date/Time: ${datetime}${service ? `\n✂️ Service: ${service}` : ""}`;
            const targetUrl = `https://wa.me/${card.whatsapp || card.phone}?text=${encodeURIComponent(whatsappText)}`;
            
            setTimeout(() => {
              window.open(targetUrl, "_blank", "noopener,noreferrer");
            }, 1200);
          } catch (err) {
            console.error(err);
          }
          setSubmitting(false);
        }}
        className="space-y-3 text-left text-xs"
      >
        <div>
          <label className={`block text-[10px] font-semibold uppercase mb-1 ${t.mutedText}`}>Name</label>
          <input
            required
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
            className="w-full border border-stone-300 rounded-lg p-2 text-xs text-stone-900 focus:ring-1 focus:ring-brand bg-white"
          />
        </div>
        <div>
          <label className={`block text-[10px] font-semibold uppercase mb-1 ${t.mutedText}`}>Phone</label>
          <input
            required
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Your Phone Number"
            className="w-full border border-stone-300 rounded-lg p-2 text-xs text-stone-900 focus:ring-1 focus:ring-brand bg-white"
          />
        </div>
        <div>
          <label className={`block text-[10px] font-semibold uppercase mb-1 ${t.mutedText}`}>Preferred Date & Time</label>
          <input
            required
            type="text"
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
            placeholder="e.g. Sunday at 2:00 PM"
            className="w-full border border-stone-300 rounded-lg p-2 text-xs text-stone-900 focus:ring-1 focus:ring-brand bg-white"
          />
        </div>
        <div>
          <label className={`block text-[10px] font-semibold uppercase mb-1 ${t.mutedText}`}>Service Requested (Optional)</label>
          <input
            type="text"
            value={service}
            onChange={(e) => setService(e.target.value)}
            placeholder="e.g. Hair Cut"
            className="w-full border border-stone-300 rounded-lg p-2 text-xs text-stone-900 focus:ring-1 focus:ring-brand bg-white"
          />
        </div>
        
        <button
          type="submit"
          disabled={submitting}
          style={card.theme !== "glassmorphic" && card.theme !== "neonDark" ? { backgroundColor: brandColor } : {}}
          className={`w-full py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-opacity cursor-pointer ${t.buttonClass} disabled:opacity-50`}
        >
          {submitting ? "Sending..." : "Request Booking via WhatsApp"}
        </button>
      </form>
    </div>
  );
}

// 8. WiFi Section Component (Auto-Connect QR Gated for Business)
export function WifiSectionRenderer({ data, card }: { data: any; card: CardData }) {
  const t = getThemeStyles(card.theme);
  const brandColor = card.brand_color || "#7c3aed";
  const ssid = data.ssid || "";
  const password = data.password || "";
  const showPassword = data.show_password !== false;

  const [revealed, setRevealed] = useState(showPassword);
  const [showQR, setShowQR] = useState(false);

  const wifiString = `WIFI:S:${ssid};T:WPA;P:${password};;`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(wifiString)}`;

  const isBusiness = card.plan === "business";

  if (!ssid) return null;

  return (
    <div className={t.cardBg}>
      <h3 className={`text-base mb-3 flex items-center gap-2 ${t.titleText}`}>
        <span>📶</span> <span>WiFi Credentials</span>
      </h3>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between py-1 border-b" style={{ borderColor: t.borderClass }}>
          <span className={t.mutedText}>Network Name (SSID)</span>
          <span className="font-semibold">{ssid}</span>
        </div>
        <div className="flex justify-between py-1 border-b items-center" style={{ borderColor: t.borderClass }}>
          <span className={t.mutedText}>Password</span>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold">{revealed ? password : "••••••••"}</span>
            <button onClick={() => setRevealed(!revealed)} className="text-[10px] underline font-medium" style={{ color: brandColor }}>
              {revealed ? "Hide" : "Reveal"}
            </button>
          </div>
        </div>
      </div>

      {isBusiness ? (
        <div className="mt-4 flex flex-col items-center">
          <button
            onClick={() => setShowQR(!showQR)}
            style={card.theme !== "glassmorphic" && card.theme !== "neonDark" ? { backgroundColor: brandColor } : {}}
            className={`w-full py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-opacity cursor-pointer ${t.buttonClass}`}
          >
            <span>📷</span> <span>{showQR ? "Hide Connect QR Code" : "Scan to Connect (WiFi QR)"}</span>
          </button>
          {showQR && (
            <div className="mt-4 p-3 bg-white rounded-xl border flex flex-col items-center gap-2 animate-fade-in shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrUrl} alt="WiFi Connect QR Code" className="w-36 h-36" />
              <span className="text-[9px] text-stone-500 font-semibold max-w-xs text-center leading-tight">
                Scan with your phone's camera app to auto-connect to the guest WiFi.
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4 bg-purple-50 border border-purple-100 rounded-xl p-3 text-center text-[10px] text-purple-900 leading-tight">
          🔒 <strong>WiFi QR Connect locked:</strong> Upgrade to the <strong>Business Plan</strong> to show a scan-to-connect WiFi QR code for your guests.
        </div>
      )}
    </div>
  );
}

// 9. Lead Capture Section Component
export function LeadCaptureSectionRenderer({ data, card }: { data: any; card: CardData }) {
  const t = getThemeStyles(card.theme);
  const brandColor = card.brand_color || "#7c3aed";
  const title = data.title || "Get in Touch";
  const success = data.success_message || "Thank you! We'll get back to you shortly.";
  const fields = data.fields || { name: true, phone: true, email: true, message: true };

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className={t.cardBg}>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center text-xs text-emerald-800 animate-fade-in w-full">
          {success}
        </div>
      </div>
    );
  }

  return (
    <div className={t.cardBg}>
      <h3 className={`text-base mb-3 flex items-center gap-2 ${t.titleText}`}>
        <span>📬</span> <span>{title}</span>
      </h3>
      
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!name.trim()) return;
          setSubmitting(true);
          try {
            await fetch(`/api/cards/${card.id}/leads`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name, phone, email, message }),
            });
            setSubmitted(true);
          } catch (err) {
            console.error(err);
          }
          setSubmitting(false);
        }}
        className="space-y-3 text-left text-xs"
      >
        <div>
          <label className={`block text-[10px] font-semibold uppercase mb-1 ${t.mutedText}`}>Name</label>
          <input
            required
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
            className="w-full border border-stone-300 rounded-lg p-2 text-xs text-stone-900 focus:ring-1 focus:ring-brand bg-white"
          />
        </div>
        {fields.phone && (
          <div>
            <label className={`block text-[10px] font-semibold uppercase mb-1 ${t.mutedText}`}>Phone</label>
            <input
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Your Phone Number"
              className="w-full border border-stone-300 rounded-lg p-2 text-xs text-stone-900 focus:ring-1 focus:ring-brand bg-white"
            />
          </div>
        )}
        {fields.email && (
          <div>
            <label className={`block text-[10px] font-semibold uppercase mb-1 ${t.mutedText}`}>Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="yourname@example.com"
              className="w-full border border-stone-300 rounded-lg p-2 text-xs text-stone-900 focus:ring-1 focus:ring-brand bg-white"
            />
          </div>
        )}
        {fields.message && (
          <div>
            <label className={`block text-[10px] font-semibold uppercase mb-1 ${t.mutedText}`}>Message</label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="How can we help you?"
              className="w-full border border-stone-300 rounded-lg p-2.5 text-xs text-stone-900 focus:ring-1 focus:ring-brand bg-white resize-none"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={card.theme !== "glassmorphic" && card.theme !== "neonDark" ? { backgroundColor: brandColor } : {}}
          className={`w-full py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-opacity cursor-pointer ${t.buttonClass} disabled:opacity-50`}
        >
          {submitting ? "Sending..." : "Submit Message"}
        </button>
      </form>
    </div>
  );
}

// 10. Amenities Section Component
export function AmenitiesSectionRenderer({ data, card }: { data: any; card: CardData }) {
  const t = getThemeStyles(card.theme);
  const list = data.amenities || [];

  if (list.length === 0) return null;

  return (
    <div className={t.cardBg}>
      <h3 className={`text-base mb-4 flex items-center gap-2 ${t.titleText}`}>
        <span>🛎️</span> <span>Amenities & Facilities</span>
      </h3>
      <div className="grid grid-cols-2 gap-2.5">
        {list.map((a: any) => (
          <div key={a.id} className={`${t.itemBg} flex items-center gap-2 py-2 px-3`}>
            <span className="text-lg shrink-0">{a.emoji}</span>
            <span className="text-xs font-medium leading-tight truncate">{a.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 11. Schedule Section Component
export function ScheduleSectionRenderer({ data, card }: { data: any; card: CardData }) {
  const t = getThemeStyles(card.theme);
  const brandColor = card.brand_color || "#7c3aed";
  const classes = data.classes || [];
  
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const [selectedDay, setSelectedDay] = useState(
    days[new Date().getDay() - 1] || "monday"
  );

  if (classes.length === 0) return null;

  const filtered = classes.filter((c: any) => c.day === selectedDay);

  return (
    <div className={t.cardBg}>
      <h3 className={`text-base mb-4 flex items-center gap-2 ${t.titleText}`}>
        <span>💪</span> <span>Weekly Schedule</span>
      </h3>

      {/* Days tabs */}
      <div className="flex overflow-x-auto gap-1.5 pb-3 scrollbar-none border-b mb-4" style={{ borderColor: t.borderClass }}>
        {days.map((day) => {
          const isActive = selectedDay === day;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              style={isActive && card.theme !== "glassmorphic" && card.theme !== "neonDark" ? { backgroundColor: brandColor, borderColor: brandColor } : {}}
              className={`px-3 py-1.5 rounded-full border text-[10px] font-semibold shrink-0 cursor-pointer transition-all capitalize ${
                isActive ? t.tabActive : t.tabInactive
              }`}
            >
              {day.slice(0, 3)}
            </button>
          );
        })}
      </div>

      {/* Class listings */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className={`text-center text-xs py-6 ${t.mutedText}`}>No classes scheduled for today.</p>
        ) : (
          filtered.map((c: any) => (
            <div key={c.id} className={`${t.itemBg} flex justify-between items-center gap-3 ${c.is_full ? "opacity-60" : ""}`}>
              <div className="space-y-0.5">
                <span className="font-bold text-xs block">{c.name}</span>
                <div className="flex flex-wrap gap-2 text-[10px]">
                  {c.instructor && <span className={t.mutedText}>👤 {c.instructor}</span>}
                  {c.capacity && <span className={t.mutedText}>👥 {c.capacity}</span>}
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="font-bold text-[10px] font-mono block" style={{ color: card.theme === "bold" ? undefined : brandColor }}>
                  {c.time}
                </span>
                {c.is_full && (
                  <span className="bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider">Full</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// 12. Pricing Table Section Component
export function PricingTableSectionRenderer({ data, card }: { data: any; card: CardData }) {
  const t = getThemeStyles(card.theme);
  const brandColor = card.brand_color || "#7c3aed";
  const plans = data.plans || [];

  if (plans.length === 0) return null;

  return (
    <div className={t.cardBg}>
      <h3 className={`text-base mb-4 flex items-center gap-2 ${t.titleText}`}>
        <span>💰</span> <span>Pricing Packages</span>
      </h3>

      <div className="flex gap-4 overflow-x-auto pb-2.5 scrollbar-none snap-x snap-mandatory">
        {plans.map((p: any) => {
          const features = (p.features || "").split("\n").filter((f: any) => f.trim());
          return (
            <div
              key={p.id}
              style={p.is_popular && card.theme !== "glassmorphic" && card.theme !== "neonDark" ? { borderColor: brandColor } : {}}
              className={`shrink-0 w-[240px] border p-4.5 rounded-xl flex flex-col justify-between snap-center bg-stone-50/50 hover:bg-stone-55 transition-all ${
                p.is_popular ? "border-brand shadow-md relative" : "border-stone-200"
              }`}
            >
              {p.is_popular && (
                <span
                  style={card.theme !== "glassmorphic" && card.theme !== "neonDark" ? { backgroundColor: brandColor } : {}}
                  className="absolute -top-2.5 right-4 bg-brand text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                >
                  Popular
                </span>
              )}
              <div className="space-y-3.5">
                <div>
                  <span className="text-xs font-bold text-stone-800 block truncate">{p.name}</span>
                  <span className="text-lg font-black block mt-1" style={{ color: card.theme === "bold" ? undefined : brandColor }}>
                    {p.price}
                  </span>
                </div>

                <div className="space-y-1.5 text-[10px] text-stone-600">
                  {features.map((f: string, idx: number) => (
                    <div key={idx} className="flex gap-1.5 items-start">
                      <span className="text-brand shrink-0 font-bold">✓</span>
                      <span className="leading-snug truncate">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {p.cta_link && (
                <a
                  href={p.cta_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={card.theme !== "glassmorphic" && card.theme !== "neonDark" ? { backgroundColor: brandColor } : {}}
                  className={`w-full py-2 mt-4 rounded-lg text-xs text-center font-bold cursor-pointer transition-opacity ${t.buttonClass}`}
                >
                  {p.cta_label || "Get Started"}
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 13. Featured Products Section Component
export function FeaturedProductsSectionRenderer({ data, card }: { data: any; card: CardData }) {
  const t = getThemeStyles(card.theme);
  const brandColor = card.brand_color || "#7c3aed";
  const products = data.products || [];
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  if (products.length === 0) return null;

  return (
    <div className={t.cardBg}>
      <h3 className={`text-base mb-4 flex items-center gap-2 ${t.titleText}`}>
        <span>🛍️</span> <span>Featured Products</span>
      </h3>

      <div className="grid grid-cols-2 gap-3.5">
        {products.map((p: any) => (
          <div
            key={p.id}
            onClick={() => setSelectedProduct(p)}
            className="border border-stone-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-sm transition-all flex flex-col bg-white"
          >
            {p.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.photo_url} alt={p.name} className="w-full aspect-[4/3] object-cover border-b" />
            ) : (
              <div className="w-full aspect-[4/3] bg-stone-100 border-b flex items-center justify-center text-stone-400 text-lg">📦</div>
            )}
            <div className="p-2.5 flex-1 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-stone-800 line-clamp-1">{p.name}</span>
              <span className="text-[10px] font-black block mt-0.5" style={{ color: brandColor }}>{p.price}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Slide Up Details Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-55 bg-black/60 backdrop-blur-xs flex items-end justify-center p-4"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-white rounded-t-2xl w-full max-w-sm overflow-hidden text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/50 hover:bg-black text-white flex items-center justify-center font-bold text-xs cursor-pointer shadow-md z-10"
                >
                  ✕
                </button>
                {selectedProduct.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selectedProduct.photo_url} alt={selectedProduct.name} className="w-full max-h-48 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-stone-100 flex items-center justify-center text-stone-400 text-3xl">📦</div>
                )}
              </div>
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <h4 className="text-sm font-bold text-stone-900">{selectedProduct.name}</h4>
                  <span className="text-sm font-black" style={{ color: brandColor }}>{selectedProduct.price}</span>
                </div>
                {selectedProduct.description && (
                  <p className="text-xs text-stone-600 leading-relaxed">{selectedProduct.description}</p>
                )}
                {selectedProduct.shop_link && (
                  <a
                    href={selectedProduct.shop_link.startsWith("http") ? selectedProduct.shop_link : `https://${selectedProduct.shop_link}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ backgroundColor: brandColor }}
                    className="w-full py-2.5 rounded-xl text-xs text-center font-semibold text-white block hover:opacity-95 transition-opacity"
                  >
                    Buy / Enquire Now
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 14. Courses Section Component
export function CoursesSectionRenderer({ data, card }: { data: any; card: CardData }) {
  const t = getThemeStyles(card.theme);
  const courses = data.courses || [];

  if (courses.length === 0) return null;

  return (
    <div className={t.cardBg}>
      <h3 className={`text-base mb-4 flex items-center gap-2 ${t.titleText}`}>
        <span>📚</span> <span>Courses Offered</span>
      </h3>
      <div className="space-y-3 text-xs">
        {courses.map((c: any) => (
          <div key={c.id} className={t.itemBg}>
            <div className="flex justify-between items-start gap-4">
              <span className="font-bold">{c.name}</span>
              {c.code && (
                <span className="font-mono text-[10px] px-1.5 py-0.5 bg-stone-200 text-stone-700 rounded select-all font-semibold">
                  {c.code}
                </span>
              )}
            </div>
            {c.description && <p className={`mt-2 text-[11px] leading-relaxed ${t.bodyText}`}>{c.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

// 15. Contact Section Component
export function ContactSectionRenderer({ card }: { card: CardData }) {
  const t = getThemeStyles(card.theme);
  const brandColor = card.brand_color || "#7c3aed";
  const links = [];

  if (card.phone) links.push({ emoji: "📞", label: `Call: ${card.phone}`, href: `tel:${card.phone}` });
  if (card.whatsapp) links.push({ emoji: "💬", label: `WhatsApp`, href: `https://wa.me/${card.whatsapp}` });
  if (card.email) links.push({ emoji: "✉️", label: `Email: ${card.email}`, href: `mailto:${card.email}` });
  if (card.website) links.push({ emoji: "🌐", label: `Website`, href: card.website });

  if (links.length === 0) return null;

  return (
    <div className={t.cardBg}>
      <h3 className={`text-base mb-3 flex items-center gap-2 ${t.titleText}`}>
        <span>📞</span> <span>Quick Contact</span>
      </h3>
      <div className="space-y-2 text-xs">
        {links.map((link, idx) => (
          <a
            key={idx}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 p-2.5 bg-stone-50 border rounded-xl hover:bg-stone-100 transition-colors"
            style={{ borderColor: t.borderClass }}
          >
            <span>{link.emoji}</span>
            <span className="font-medium text-stone-850 truncate">{link.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

// 16. Socials Section Component
export function SocialsSectionRenderer({ card }: { card: CardData }) {
  const t = getThemeStyles(card.theme);
  const socials = [];

  if (card.facebook) socials.push({ emoji: "📘", label: "Facebook", href: card.facebook });
  if (card.instagram) socials.push({ emoji: "📸", label: "Instagram", href: card.instagram });
  if (card.tiktok) socials.push({ emoji: "🎵", label: "TikTok", href: card.tiktok });
  if (card.youtube) socials.push({ emoji: "🎥", label: "YouTube", href: card.youtube });

  if (socials.length === 0) return null;

  return (
    <div className={t.cardBg}>
      <h3 className={`text-base mb-3.5 flex items-center gap-2 ${t.titleText}`}>
        <span>🔗</span> <span>Follow Us</span>
      </h3>
      <div className="grid grid-cols-2 gap-2.5">
        {socials.map((soc, idx) => (
          <a
            key={idx}
            href={soc.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 p-2.5 border rounded-xl hover:bg-stone-100 transition-colors text-xs font-semibold text-stone-850 bg-stone-50"
            style={{ borderColor: t.borderClass }}
          >
            <span>{soc.emoji}</span>
            <span>{soc.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
