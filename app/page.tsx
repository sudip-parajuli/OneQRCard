import Link from "next/link";
import { SITE } from "@/lib/config";
import PricingCards from "@/components/PricingCards";
import CarouselShowcase from "@/components/CarouselShowcase";

export const revalidate = 0;

export default async function HomePage() {
  return (
    <main className="bg-stone-50 min-h-screen text-stone-900 overflow-x-hidden">
      {/* 1. Navigation Header */}
      <header className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between border-b border-stone-200/50 bg-white/50 backdrop-blur-sm sticky top-0 z-45">
        <div className="font-bold text-xl tracking-tight flex items-center gap-2 text-stone-900">
          <span className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white text-sm font-black shadow-sm">QR</span>
          {SITE.name}
        </div>
        <nav className="flex items-center gap-5 sm:gap-6 text-sm">
          <Link href="/pricing" className="text-stone-600 hover:text-stone-900 font-medium transition-colors">
            Pricing
          </Link>
          <Link href="/edit" className="text-stone-600 hover:text-stone-900 font-medium transition-colors">
            Manage my card
          </Link>
          <Link
            href="/create"
            className="bg-brand text-white px-4 py-2 rounded-xl font-semibold hover:bg-brand-hover shadow-sm transition-all text-xs sm:text-sm"
          >
            Create your card
          </Link>
        </nav>
      </header>

      {/* 2. Hero Section */}
      <section className="max-w-4xl mx-auto px-6 pt-16 sm:pt-20 pb-16 text-center animate-fade-in">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-stone-900 leading-[1.1] max-w-3xl mx-auto">
          You have 5 QR codes. <br />
          <span className="text-brand">Your customers have one phone.</span>
        </h1>
        <p className="text-stone-500 mt-6 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
          {SITE.name} replaces your separate printed QR codes for contact details, WhatsApp, Google reviews, social media, menu, and more — with a single scannable, mobile-optimized profile for your business.
        </p>
        
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link
            href="/create"
            className="w-full sm:w-auto px-8 py-3.5 bg-brand text-white rounded-xl font-bold text-sm sm:text-base hover:bg-brand-hover shadow-md hover:shadow-lg transition-all text-center"
          >
            Create your free card
          </Link>
          <Link
            href="/demo/restaurant"
            className="w-full sm:w-auto px-8 py-3.5 bg-white border border-stone-200 text-stone-700 rounded-xl font-semibold text-sm sm:text-base hover:bg-stone-50 transition-all text-center shadow-sm"
          >
            See an example →
          </Link>
        </div>

        <p className="text-xs text-stone-400 mt-5 font-medium tracking-wide">
          Used by restaurants, hotels, salons &amp; consultancies across Nepal
        </p>
      </section>

      {/* 3. Before / After Split Panel */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          {/* BEFORE column (The Problem) */}
          <div className="bg-white border border-red-200/60 rounded-3xl p-8 flex flex-col justify-between shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-500/80"></div>
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-bold text-red-500 uppercase tracking-widest bg-red-50 px-2.5 py-1 rounded-full border border-red-100">Before</span>
                <span className="text-red-500 text-xs font-semibold">❌ Cluttered &amp; Ignored</span>
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">5 Separate QR Codes</h3>
              <p className="text-stone-500 text-xs sm:text-sm leading-relaxed mb-8">
                Most businesses hand out multiple printed QR codes. Customers get overwhelmed trying to scan everything, or simply ignore the rest.
              </p>
              
              {/* Scattered QRs Grid */}
              <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto mb-6 p-4 bg-stone-50 rounded-2xl border border-stone-200/50">
                {[
                  { label: "WhatsApp QR", icon: "💬" },
                  { label: "Contact QR", icon: "👤" },
                  { label: "Review QR", icon: "⭐" },
                  { label: "Menu QR", icon: "🍔" },
                  { label: "Instagram QR", icon: "📸" },
                  { label: "WiFi QR", icon: "📶" }
                ].map((qr, idx) => (
                  <div key={idx} className="bg-white border border-stone-200 p-2.5 rounded-xl text-center shadow-xs relative opacity-70 scale-95 hover:scale-100 transition-transform">
                    <div className="w-10 h-10 border border-dashed border-stone-300 rounded flex items-center justify-center text-lg mx-auto mb-1.5 bg-stone-50">
                      {qr.icon}
                    </div>
                    <div className="text-[9px] font-semibold text-stone-500 truncate">{qr.label}</div>
                    <div className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-red-500 text-white flex items-center justify-center text-[9px] font-bold shadow-sm">✕</div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-stone-400 text-center font-medium">
              Customers scan one code, ignore the rest. Hard to print, hard to manage.
            </p>
          </div>

          {/* AFTER column (The Solution) */}
          <div className="bg-white border border-emerald-200 rounded-3xl p-8 flex flex-col justify-between shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500"></div>
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">After</span>
                <span className="text-emerald-600 text-xs font-semibold">✨ One Scan, Everything</span>
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">One Branded QR Card</h3>
              <p className="text-stone-500 text-xs sm:text-sm leading-relaxed mb-8">
                A single elegant QR code. When scanned, it loads a beautiful dashboard displaying your menu, location, services, contact save, and review gate.
              </p>

              {/* Single QR Graphic - Real asset mockup */}
              <div className="max-w-[220px] mx-auto bg-stone-50 border border-stone-200/50 p-5 rounded-2xl flex flex-col items-center shadow-xs mb-6 relative">
                <div className="w-28 h-28 bg-white border border-stone-200/80 rounded-xl p-2 flex items-center justify-center shadow-sm relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/qr_mockup.png"
                    alt="Branded QR Code Mockup"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-[10px] font-bold text-brand mt-4 text-center">
                  Your business logo. <br /> Your brand colors. One QR.
                </div>
              </div>
            </div>
            <p className="text-xs text-emerald-600 text-center font-semibold">
              Scan one code. Access everything instantly. Permanent &amp; editable.
            </p>
          </div>
        </div>
      </section>

      {/* 4. How It Works Mockups (KEEPER, Reverted) */}
      <section className="max-w-5xl mx-auto px-6 pb-24 text-center">
        <h2 className="text-2xl font-bold text-stone-900 mb-2">How it works</h2>
        <p className="text-stone-550 mb-12 max-w-md mx-auto text-sm">
          See how seamless it is for clients and customers to connect with your business.
        </p>

        <div className="flex flex-col md:flex-row gap-6 md:gap-4 items-center justify-center">
          {/* Step 1 */}
          <div className="flex flex-col items-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-4">Step 1 — Scan</div>
            <div className="w-[245px] h-[510px] bg-stone-950 rounded-[38px] p-2.5 shadow-2xl relative flex-shrink-0 border border-stone-800">
              <div className="w-full h-full bg-[#0b1a3a] rounded-[28px] overflow-hidden relative flex items-center justify-center">
                <div className="w-[150px] h-[150px] bg-white/5 border-2 border-white/30 rounded-2xl relative">
                  <div className="absolute -top-[2px] -left-[2px] w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                  <div className="absolute -top-[2px] -right-[2px] w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                  <div className="absolute -bottom-[2px] -left-[2px] w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                  <div className="absolute -bottom-[2px] -right-[2px] w-6 h-6 border-b-4 border-r-4 border-white rounded-br-lg"></div>
                  <div className="absolute top-1/2 left-2 right-2 h-[2px] bg-blue-500 animate-pulse"></div>
                </div>
                <div className="absolute bottom-6 left-0 right-0 text-center text-white/70 text-xs px-4">
                  Point camera at QR code
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Arrow */}
          <div className="hidden md:flex items-center justify-center text-stone-300 text-2xl h-[510px] pt-8">
            <span className="font-bold">&rarr;</span>
          </div>
          {/* Mobile Arrow */}
          <div className="flex md:hidden items-center justify-center text-stone-300 text-xl py-2">
            <span className="font-bold">&darr;</span>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-4">Step 2 — Card Opens</div>
            <div className="w-[245px] h-[510px] bg-stone-950 rounded-[38px] p-2.5 shadow-2xl relative flex-shrink-0 border border-stone-800">
              <div className="w-full h-full rounded-[28px] overflow-hidden relative bg-gradient-to-b from-[#2b5bdb] to-[#6e96ee]">
                <div className="pt-6 px-4 pb-14 text-center">
                  <div className="w-14 h-14 rounded-full bg-[#cc2222] border-2 border-[#f0c14b] flex items-center justify-center mx-auto mb-2 text-[8px] font-bold text-white tracking-widest leading-none">EASYMOTO</div>
                  <div className="font-bold text-white text-sm leading-tight">Easymoto</div>
                  <div className="text-[10px] text-blue-100 mt-1 leading-normal">Convenient ride for every adventures</div>
                </div>

                <div className="absolute top-[138px] left-0 right-0 bottom-0 bg-white rounded-t-3xl p-4 overflow-y-auto scrollbar-none">
                  <div className="flex flex-col gap-2">
                    <div className="py-2 bg-[#2b5bdb] text-white rounded-xl text-center text-[11px] font-semibold shadow-sm">
                      Save to contacts
                    </div>
                    <div className="py-1.5 bg-white border border-[#2b5bdb] text-[#2b5bdb] rounded-xl text-center text-[11px] font-semibold flex items-center justify-center gap-1">
                      Download business card
                    </div>
                    <div className="py-1.5 bg-amber-50/70 border border-amber-200 text-amber-900 rounded-xl px-2.5 flex items-center gap-2 text-[10px] font-semibold">
                      Review us on Google
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 border border-stone-100 rounded-xl text-[10px] text-stone-850 font-medium bg-stone-50/50">
                      Call — 98XXXXXXXX
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 border border-stone-100 rounded-xl text-[10px] text-stone-850 font-medium bg-stone-50/50">
                      WhatsApp
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 border border-stone-100 rounded-xl text-[10px] text-stone-850 font-medium bg-stone-50/50">
                      Website
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 border border-stone-100 rounded-xl text-[10px] text-stone-850 font-medium bg-stone-50/50">
                      Facebook
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 border border-stone-100 rounded-xl text-[10px] text-stone-850 font-medium bg-stone-50/50">
                      Instagram
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Arrow */}
          <div className="hidden md:flex items-center justify-center text-stone-300 text-2xl h-[510px] pt-8">
            <span className="font-bold">&rarr;</span>
          </div>
          {/* Mobile Arrow */}
          <div className="flex md:hidden items-center justify-center text-stone-300 text-xl py-2">
            <span className="font-bold">&darr;</span>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-4">Step 3 — Saved</div>
            <div className="w-[245px] h-[510px] bg-stone-950 rounded-[38px] p-2.5 shadow-2xl relative flex-shrink-0 border border-stone-800">
              <div className="w-full h-full bg-[#f5f5f5] rounded-[28px] overflow-hidden flex flex-col pt-8">
                <div className="text-center px-4">
                  <div className="w-14 h-14 rounded-full bg-[#cc2222] border-2 border-[#f0c14b] flex items-center justify-center mx-auto mb-2 text-[8px] font-bold text-white tracking-widest leading-none">EASYMOTO</div>
                  <div className="text-sm font-semibold text-stone-900 leading-tight">Easymoto</div>
                  <div className="text-[10px] text-stone-400 mb-4">New contact</div>
                </div>
                <div className="bg-white rounded-2xl mx-4 py-1 flex-1 border border-stone-200/50 shadow-sm text-[10px]">
                  <div className="flex justify-between items-center py-2.5 px-3 border-b border-stone-100">
                    <span className="text-stone-400">mobile</span>
                    <span className="text-stone-900 font-medium">98XXXXXXXX</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 px-3 border-b border-stone-100">
                    <span className="text-stone-400">whatsapp</span>
                    <span className="text-stone-900 font-medium">+977 98XXXXXXXX</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 px-3">
                    <span className="text-stone-400">website</span>
                    <span className="text-blue-600 font-medium">easymoto.com.np</span>
                  </div>
                </div>
                <div className="m-4 p-2.5 bg-[#2b5bdb] text-white rounded-xl text-center text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5">
                  Contact saved
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Branded QR & Printed Cards Section (KEEPER, Reverted) */}
      <section className="bg-stone-100 border-y border-stone-200/80 py-20 my-12">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <h2 className="text-3xl font-bold tracking-tight text-stone-900 mb-4">
              Branded QR Codes &amp; Printed Cards
            </h2>
            <p className="text-stone-500 mb-6 leading-relaxed text-sm">
              Every digital card comes with a custom QR code embedded with your logo. Plus, generate a professional, print-ready physical business card in one click.
            </p>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center flex-shrink-0 text-xs mt-0.5 font-bold">
                  ✓
                </div>
                <div>
                  <h4 className="font-semibold text-stone-900 text-sm">Logo-embedded QR Codes</h4>
                  <p className="text-xs text-stone-500 mt-0.5">Custom brand colors and logo inside the QR code itself.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center flex-shrink-0 text-xs mt-0.5 font-bold">
                  ✓
                </div>
                <div>
                  <h4 className="font-semibold text-stone-900 text-sm">300 DPI Print-Ready Layout</h4>
                  <p className="text-xs text-stone-500 mt-0.5">Standard 3.5&quot; x 2&quot; sizing with background watermarks and custom themes.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative h-[280px] sm:h-[320px] w-full flex items-center justify-center">
            {/* Business Card Mockup */}
            <div className="absolute left-4 top-4 sm:left-8 sm:top-6 w-[72%] max-w-[380px] aspect-[1.75] shadow-2xl rounded-xl overflow-hidden border border-stone-200/60 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/business_card_mockup.png"
                alt="Printed Business Card Mockup"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* QR Code Mockup */}
            <div className="absolute right-4 bottom-4 sm:right-8 sm:bottom-6 w-[36%] max-w-[180px] aspect-square shadow-2xl rounded-2xl p-3 bg-white border border-stone-200/60 transform rotate-6 hover:rotate-0 transition-transform duration-300">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/qr_mockup.png"
                alt="Branded QR Code"
                className="w-full h-full object-contain rounded-lg border border-stone-100"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 6. Feature Highlights Section (Redesigned Editorial Style) */}
      <section className="bg-white border-y border-stone-200/80 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-stone-900">
              Powerful Features, Engineered to Convert
            </h2>
            <p className="text-stone-500 mt-3 text-sm sm:text-base">
              Everything your business needs to build a modern mobile presence in under 10 minutes.
            </p>
          </div>

          {/* Grid Layout */}
          <div className="grid md:grid-cols-[1.2fr_1fr] gap-8 items-stretch mb-8">
            
            {/* LEFT: Large "One QR, Everything" Card (spans 2 rows potentially) */}
            <div className="bg-stone-900 text-white rounded-3xl p-8 flex flex-col justify-between shadow-sm border border-stone-850 hover:shadow-md transition-all duration-200">
              <div>
                <h3 className="text-2xl font-bold mb-4">One QR, Everything</h3>
                <p className="text-stone-400 text-sm leading-relaxed">
                  Consolidate all customer interaction points into a single branded portal. Replaces scattered stickers for contacts, menus, WiFi auto-connect, social links, booking requests, and reviews. Simplify their scanning experience.
                </p>
              </div>

              {/* Collapsing animation */}
              <div className="relative w-full h-44 flex items-center justify-center overflow-hidden bg-stone-950/60 rounded-2xl mt-6 border border-stone-800">
                <style>{`
                  @keyframes collapse1 {
                    0% { transform: translate(-90px, -45px) scale(1); opacity: 0.8; }
                    45%, 100% { transform: translate(0, 0) scale(0.3); opacity: 0; }
                  }
                  @keyframes collapse2 {
                    0% { transform: translate(90px, -35px) scale(1); opacity: 0.8; }
                    45%, 100% { transform: translate(0, 0) scale(0.3); opacity: 0; }
                  }
                  @keyframes collapse3 {
                    0% { transform: translate(-70px, 45px) scale(1); opacity: 0.8; }
                    45%, 100% { transform: translate(0, 0) scale(0.3); opacity: 0; }
                  }
                  @keyframes collapse4 {
                    0% { transform: translate(70px, 45px) scale(1); opacity: 0.8; }
                    45%, 100% { transform: translate(0, 0) scale(0.3); opacity: 0; }
                  }
                  @keyframes collapse5 {
                    0% { transform: translate(0, -65px) scale(1); opacity: 0.8; }
                    45%, 100% { transform: translate(0, 0) scale(0.3); opacity: 0; }
                  }
                  .animate-c1 { animation: collapse1 3.5s infinite cubic-bezier(0.25, 1, 0.5, 1); }
                  .animate-c2 { animation: collapse2 3.5s infinite cubic-bezier(0.25, 1, 0.5, 1) 0.5s; }
                  .animate-c3 { animation: collapse3 3.5s infinite cubic-bezier(0.25, 1, 0.5, 1) 1s; }
                  .animate-c4 { animation: collapse4 3.5s infinite cubic-bezier(0.25, 1, 0.5, 1) 1.5s; }
                  .animate-c5 { animation: collapse5 3.5s infinite cubic-bezier(0.25, 1, 0.5, 1) 2s; }
                `}</style>
                {/* Center QR card */}
                <div className="w-16 h-16 bg-[#085041] rounded-xl flex items-center justify-center text-white font-extrabold shadow-[0_0_20px_rgba(8,80,65,0.4)] z-10 border border-brand/30 animate-pulse">
                  QR
                </div>
                {/* Collapsing crossed-out QRs */}
                <div className="absolute animate-c1 w-9 h-9 bg-stone-800 text-red-500 border border-red-500/20 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm">✕</div>
                <div className="absolute animate-c2 w-9 h-9 bg-stone-800 text-red-500 border border-red-500/20 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm">✕</div>
                <div className="absolute animate-c3 w-9 h-9 bg-stone-800 text-red-500 border border-red-500/20 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm">✕</div>
                <div className="absolute animate-c4 w-9 h-9 bg-stone-800 text-red-500 border border-red-500/20 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm">✕</div>
                <div className="absolute animate-c5 w-9 h-9 bg-stone-800 text-red-500 border border-red-500/20 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm">✕</div>
              </div>
            </div>

            {/* RIGHT: Two Stacked Cards */}
            <div className="flex flex-col gap-6 justify-between">
              {/* Top: Branded QR with Logo */}
              <div className="bg-white border border-stone-200 rounded-3xl p-6 flex flex-col justify-between hover:shadow-md transition-all duration-200">
                <div>
                  <h4 className="font-bold text-stone-900 text-base mb-1.5">Branded QR with your logo</h4>
                  <p className="text-stone-500 text-xs sm:text-sm leading-relaxed">
                    Custom themes, dots, and colors representing your unique identity. Stand out with vectors.
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-center bg-stone-50 border border-stone-150 rounded-2xl p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/qr_mockup.png"
                    alt="Logo QR code"
                    className="w-16 h-16 object-contain"
                  />
                </div>
              </div>

              {/* Bottom: Google Review Funnel */}
              <div className="bg-white border border-stone-200 rounded-3xl p-6 flex flex-col justify-between hover:shadow-md transition-all duration-200">
                <div>
                  <h4 className="font-bold text-stone-900 text-base mb-1.5">Google Review Funnel</h4>
                  <p className="text-stone-500 text-xs sm:text-sm leading-relaxed">
                    Filter ratings: Happy clients are routed to Google; others submit private feedback to your email.
                  </p>
                </div>
                {/* Visual diagram */}
                <div className="mt-4 flex flex-col gap-3 max-w-[240px] mx-auto text-[11px] font-semibold w-full bg-stone-50 border border-stone-150 p-4 rounded-2xl">
                  {/* Happy path */}
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs">😊</div>
                    <div className="flex-1 h-0.5 border-t border-dashed border-stone-300"></div>
                    <div className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg shadow-xs shrink-0">
                      ⭐ Google Review
                    </div>
                  </div>
                  {/* Unhappy path */}
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-xs">☹️</div>
                    <div className="flex-1 h-0.5 border-t border-dashed border-stone-300"></div>
                    <div className="px-2.5 py-1 bg-stone-50 text-stone-700 border border-stone-200 rounded-lg shadow-xs shrink-0">
                      📥 Owner Inbox
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Row of 3 Equal Cards Below */}
          <div className="grid sm:grid-cols-3 gap-6">
            
            {/* Business-Type Profiles */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-stone-900 text-base mb-1.5">Business-Type Profiles</h4>
                <p className="text-stone-555 text-xs leading-relaxed">
                  Tailored layout presets for your vertical (Menus, Services, Amenities).
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {["🍽️ Restaurant", "💆 Salon", "🏨 Hotel", "📷 Studio", "💼 Corp"].map((tag) => (
                  <span key={tag} className="text-[10px] font-semibold bg-stone-50 text-stone-600 border border-stone-150 px-2 py-0.5 rounded-lg">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Save to Contacts */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-stone-900 text-base mb-1.5">Save to Contacts</h4>
                <p className="text-stone-555 text-xs leading-relaxed">
                  Customers save your phone and links to their address book in one tap.
                </p>
              </div>
              <div className="mt-4 py-2 px-3 border border-stone-150 rounded-xl bg-stone-50 text-stone-700 font-bold text-center text-[10px] shadow-inner uppercase tracking-wider">
                📥 Save Contact Card (.vcf)
              </div>
            </div>

            {/* Lifetime Hosting */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-stone-900 text-base mb-1.5">Lifetime Hosting</h4>
                <p className="text-stone-555 text-xs leading-relaxed">
                  No subscriptions or anxiety. Permanent link updates anytime.
                </p>
              </div>
              <div className="mt-4 text-center">
                <div className="text-2xl font-black text-brand">Rs 500</div>
                <div className="text-[9px] text-stone-400 font-bold uppercase tracking-wider mt-0.5">Once. Forever.</div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 7. Business-Type Carousel Showcase */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-2">See it in action for your business</h2>
        <p className="text-stone-500 mb-8 max-w-md mx-auto text-sm">
          Browse real, live interactive profile mockups customized for different industry needs. Click any card to open the live demo.
        </p>

        <CarouselShowcase />
      </section>

      {/* 8. Testimonials Section (Cleaned up Placeholder boxes for conversion) */}
      <section className="bg-stone-100/60 border-y border-stone-200/60 py-20 text-center">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-brand/5 border border-brand/10 rounded-2xl py-3 px-6 w-fit mx-auto mb-10 text-xs sm:text-sm font-bold text-brand shadow-xs">
            🚀 Used by businesses across Nepal
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-12 font-sans">Loved by local business owners</h2>
          
          <div className="grid md:grid-cols-3 gap-6 text-left">
            {/* Slot 1: Easymoto */}
            <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed italic">&quot;One-QR-Card replaced 4 physical card designs at our service. Now customers scan, save our number, and WhatsApp us in one go.&quot;</p>
              <div className="mt-4 pt-4 border-t border-stone-100">
                <div className="font-bold text-stone-900 text-xs sm:text-sm">Rohan Shakya</div>
                <div className="text-[10px] text-stone-400 font-semibold mt-0.5">Operations Head, Easymoto Ride Sharing</div>
              </div>
            </div>

            {/* Slot 2: Placeholder Box */}
            <div className="border border-dashed border-stone-300 bg-stone-50/60 rounded-2xl p-6 flex flex-col justify-between h-full">
              <p className="text-stone-500 text-xs sm:text-sm leading-relaxed italic">&quot;Be one of our first reviews — scan, create your card, and share your experience.&quot;</p>
              <div className="mt-4 pt-4 border-t border-dashed border-stone-200 flex justify-between items-center">
                <div>
                  <div className="font-bold text-stone-600 text-xs sm:text-sm">Your name here</div>
                  <div className="text-[10px] text-stone-400 font-semibold mt-0.5">Business owner</div>
                </div>
                <a 
                  href="mailto:support@oneqrcard.com" 
                  className="text-[10px] font-bold text-brand hover:underline"
                >
                  Share your story &rarr;
                </a>
              </div>
            </div>

            {/* Slot 3: Placeholder Box */}
            <div className="border border-dashed border-stone-300 bg-stone-50/60 rounded-2xl p-6 flex flex-col justify-between h-full">
              <p className="text-stone-500 text-xs sm:text-sm leading-relaxed italic">&quot;Be one of our first reviews — scan, create your card, and share your experience.&quot;</p>
              <div className="mt-4 pt-4 border-t border-dashed border-stone-200 flex justify-between items-center">
                <div>
                  <div className="font-bold text-stone-600 text-xs sm:text-sm">Your name here</div>
                  <div className="text-[10px] text-stone-400 font-semibold mt-0.5">Business owner</div>
                </div>
                <a 
                  href="mailto:support@oneqrcard.com" 
                  className="text-[10px] font-bold text-brand hover:underline"
                >
                  Share your story &rarr;
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 9. Pricing Section */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-2">
          One-time payment. Lifetime hosting.
        </h2>
        <p className="text-stone-500 text-center mb-12 text-sm sm:text-base">
          No subscriptions, no hidden monthly charges. Pay once, use forever.
        </p>
        <PricingCards />
      </section>

      {/* 10. Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-12 text-center text-xs sm:text-sm text-stone-400 border-t border-stone-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          &copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.
        </div>
        <div className="flex items-center gap-4">
          <Link href="/edit" className="underline hover:text-stone-700 transition-colors">
            Is this your card? Edit it →
          </Link>
          <span>&middot;</span>
          <a href={`mailto:${SITE.supportEmail}`} className="underline hover:text-stone-700 transition-colors">
            {SITE.supportEmail}
          </a>
        </div>
      </footer>
    </main>
  );
}
