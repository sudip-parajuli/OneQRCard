"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface SlideItem {
  emoji: string;
  type: string;
  label: string;
  name: string;
  color: string;
  desc: string;
  tab: string;
}

const SLIDES: SlideItem[] = [
  {
    emoji: "🍽️",
    type: "restaurant",
    label: "Restaurant / Café",
    name: "The Himalayan Bistro",
    color: "#c0392b",
    desc: "Displays food categories, prices, items marked as popular, and a call-to-order button.",
    tab: "🍽️ Menu",
  },
  {
    emoji: "💆",
    type: "salon",
    label: "Salon & Spa",
    name: "Glow & Co. Salon",
    color: "#6c3483",
    desc: "Showcases standard price tables, duration, portfolio images, and booking appointments.",
    tab: "✂️ Services",
  },
  {
    emoji: "🏨",
    type: "hotel",
    label: "Hotel & Stay",
    name: "Summit View Boutique",
    color: "#1a5276",
    desc: "Showcases custom room services, guest WiFi auto-connect QR, and resort amenities.",
    tab: "📍 Info / WiFi",
  },
  {
    emoji: "📷",
    type: "creative",
    label: "Creative / Artist",
    name: "Studio Canvas",
    color: "#2c2c2c",
    desc: "Highlights grid portfolios, photography albums, packages, and calendar integrations.",
    tab: "📷 Gallery",
  },
  {
    emoji: "💼",
    type: "consultant",
    label: "Consultancy",
    name: "Apex Advisory Group",
    color: "#2c3e50",
    desc: "Focuses on consultation request fields, lead capture boxes, and corporate office details.",
    tab: "📅 Book / Leads",
  }
];

export default function CarouselShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const startX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const total = SLIDES.length;

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % total);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  };

  // Autoplay
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused, activeIndex]);

  // Touch & Swipe handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
    setIsPaused(true);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (startX.current === null) return;
    const diffX = e.clientX - startX.current;
    const threshold = 50; // minimum drag distance in px
    if (Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    }
    startX.current = null;
    setIsPaused(false);
  };

  const handlePointerLeave = () => {
    startX.current = null;
    setIsPaused(false);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto px-4 py-8">
      {/* Outer wrapper with overflow control */}
      <div 
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="overflow-hidden cursor-grab active:cursor-grabbing relative select-none rounded-3xl"
      >
        {/* Carousel Tracks */}
        <div 
          className="flex transition-transform duration-500 ease-out"
          style={{ 
            transform: `translateX(-${activeIndex * 100}%)`,
          }}
        >
          {SLIDES.map((item, idx) => (
            <div 
              key={idx} 
              className="w-full flex-shrink-0 flex justify-center items-stretch"
            >
              {/* Card Container - Desktop peeks slightly */}
              <div className="w-full max-w-xl bg-white border border-stone-200 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex justify-between items-center mb-5">
                    <span className="text-3xl">{item.emoji}</span>
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest bg-stone-50 px-2.5 py-1 rounded-full border border-stone-150">
                      {item.label}
                    </span>
                  </div>
                  <h4 className="font-bold text-stone-900 text-lg md:text-xl truncate">{item.name}</h4>
                  <p className="text-stone-500 text-sm mt-2 leading-relaxed min-h-[60px]">
                    {item.desc}
                  </p>
                  
                  {/* Mini Tab Preview Mockup */}
                  <div className="mt-6 bg-stone-50 rounded-2xl p-4 border border-stone-150 shadow-inner">
                    <div className="flex gap-2 overflow-x-auto pb-2.5 border-b border-stone-200 mb-3.5 scrollbar-none text-[11px] font-semibold">
                      <span 
                        style={{ backgroundColor: item.color }} 
                        className="text-white px-3 py-1 rounded-xl shadow-xs"
                      >
                        {item.tab}
                      </span>
                      <span className="text-stone-450 bg-white border border-stone-200 px-3 py-1 rounded-xl">
                        👤 About
                      </span>
                      <span className="text-stone-450 bg-white border border-stone-200 px-3 py-1 rounded-xl">
                        📞 Contact
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2.5 bg-stone-200/80 rounded-full w-3/4"></div>
                      <div className="h-2 bg-stone-200/80 rounded-full w-1/2"></div>
                      <div className="h-2 bg-stone-200/80 rounded-full w-2/3"></div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-between items-center border-t border-stone-100 pt-5">
                  <Link
                    href={`/demo/${item.type}`}
                    className="text-sm font-semibold text-brand hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Open demo profile 
                    <span className="text-xs transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                  <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">
                    Preset {idx + 1} of {total}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vertical centered arrow controls */}
      <button
        onClick={prevSlide}
        type="button"
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-white border border-stone-200 rounded-full flex items-center justify-center shadow-md hover:bg-stone-50 hover:scale-105 active:scale-95 transition-all z-20 cursor-pointer"
        aria-label="Previous Slide"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-stone-600">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        type="button"
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-10 h-10 bg-white border border-stone-200 rounded-full flex items-center justify-center shadow-md hover:bg-stone-50 hover:scale-105 active:scale-95 transition-all z-20 cursor-pointer"
        aria-label="Next Slide"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-stone-600">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Dot Indicators */}
      <div className="flex justify-center gap-2 mt-6">
        {SLIDES.map((item, idx) => {
          const isActive = idx === activeIndex;
          return (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              type="button"
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                isActive ? "w-6 bg-brand" : "bg-stone-300"
              }`}
              style={isActive ? { backgroundColor: item.color } : {}}
              aria-label={`Go to slide ${idx + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
}
