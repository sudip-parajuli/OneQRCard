import Link from "next/link";
import { SITE } from "@/lib/config";
import PricingCards from "@/components/PricingCards";
import { supabaseAdmin } from "@/lib/supabase";

export const revalidate = 0;

async function getPaidCount(): Promise<number> {
  try {
    const db = supabaseAdmin();
    const { count, error } = await db
      .from("cards")
      .select("*", { count: "exact", head: true })
      .eq("payment_status", "paid");
    
    if (error) throw error;
    return count || 0;
  } catch (err) {
    console.error("Failed to fetch paid count:", err);
    return 2; // Fallback to seeded count
  }
}

export default async function HomePage() {
  const paidCount = await getPaidCount();

  return (
    <main className="bg-stone-50 min-h-screen text-stone-900 overflow-x-hidden">
      {/* Navigation Header */}
      <header className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between border-b border-stone-200/50 bg-white/50 backdrop-blur-sm sticky top-0 z-40">
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

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 pt-16 sm:pt-20 pb-16 text-center">
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
            href="/card/demo-restaurant"
            target="_blank"
            className="w-full sm:w-auto px-8 py-3.5 bg-white border border-stone-200 text-stone-700 rounded-xl font-semibold text-sm sm:text-base hover:bg-stone-50 transition-all text-center shadow-sm"
          >
            See an example →
          </Link>
        </div>

        <p className="text-xs text-stone-400 mt-5 font-medium tracking-wide">
          Used by restaurants, hotels, salons &amp; consultancies across Nepal
        </p>
      </section>

      {/* Before / After Split Panel */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          {/* Before Column (The Problem) */}
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

          {/* After Column (The Solution) */}
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

              {/* Single QR Graphic */}
              <div className="max-w-[220px] mx-auto bg-stone-50 border border-stone-200/50 p-5 rounded-2xl flex flex-col items-center shadow-xs mb-6 relative">
                {/* SVG QR Code Mockup */}
                <div className="w-28 h-28 bg-white border border-stone-200/80 rounded-xl p-2 flex items-center justify-center shadow-sm relative overflow-hidden">
                  <svg className="w-full h-full text-brand" viewBox="0 0 100 100" fill="currentColor">
                    {/* QR Finder patterns */}
                    <rect x="0" y="0" width="25" height="25" rx="3" fill="#085041" />
                    <rect x="4" y="4" width="17" height="17" rx="2" fill="white" />
                    <rect x="8" y="8" width="9" height="9" rx="1" fill="#085041" />

                    <rect x="75" y="0" width="25" height="25" rx="3" fill="#085041" />
                    <rect x="79" y="4" width="17" height="17" rx="2" fill="white" />
                    <rect x="83" y="8" width="9" height="9" rx="1" fill="#085041" />

                    <rect x="0" y="75" width="25" height="25" rx="3" fill="#085041" />
                    <rect x="4" y="79" width="17" height="17" rx="2" fill="white" />
                    <rect x="8" y="83" width="9" height="9" rx="1" fill="#085041" />

                    {/* Small modules mock */}
                    <rect x="35" y="5" width="5" height="5" rx="1" />
                    <rect x="45" y="0" width="10" height="5" rx="1" />
                    <rect x="60" y="10" width="5" height="10" rx="1" />
                    <rect x="30" y="20" width="10" height="5" rx="1" />
                    <rect x="5" y="35" width="5" height="10" rx="1" />
                    <rect x="15" y="45" width="10" height="5" rx="1" />
                    <rect x="40" y="30" width="5" height="10" rx="1" />

                    <rect x="75" y="35" width="5" height="5" rx="1" />
                    <rect x="85" y="40" width="10" height="5" rx="1" />
                    <rect x="90" y="55" width="5" height="10" rx="1" />
                    <rect x="80" y="65" width="15" height="5" rx="1" />
                    
                    <rect x="35" y="75" width="5" height="10" rx="1" />
                    <rect x="45" y="85" width="10" height="5" rx="1" />
                    <rect x="60" y="80" width="5" height="15" rx="1" />

                    {/* Center logo backdrop */}
                    <circle cx="50" cy="50" r="14" fill="white" />
                    <circle cx="50" cy="50" r="10" fill="#085041" />
                    {/* Small inner logo letter 'Q' */}
                    <text x="50" y="54" fill="white" fontSize="12" fontWeight="black" textAnchor="middle">Q</text>
                  </svg>
                </div>
                <div className="text-[10px] font-bold text-brand mt-3 uppercase tracking-wider bg-brand/5 px-2.5 py-0.5 rounded-full border border-brand/10">one-qr-card.com</div>
              </div>
            </div>
            <p className="text-xs text-emerald-600 text-center font-semibold">
              Scan one code. Access everything instantly. Permanent &amp; editable.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
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

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-stone-50 border border-stone-200/60 rounded-2xl p-6 hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-brand/10 text-brand rounded-xl flex items-center justify-center text-lg font-bold mb-4 shadow-sm">📱</div>
              <h3 className="font-bold text-stone-900 text-base mb-2">One QR, Everything</h3>
              <p className="text-stone-500 text-xs sm:text-sm leading-relaxed">
                Provide menu listings, social links, direct contact saving, Google review routing, and custom lead collection forms from one scan.
              </p>
            </div>

            {/* Feature 2: Animated QR Reveal */}
            <div className="bg-stone-50 border border-stone-200/60 rounded-2xl p-6 hover:shadow-md transition-all relative overflow-hidden group">
              {/* QR Animation Container */}
              <div className="w-10 h-10 bg-brand/10 text-brand rounded-xl flex items-center justify-center text-lg font-bold mb-4 shadow-sm relative z-10">🎨</div>
              
              <h3 className="font-bold text-stone-900 text-base mb-2">Branded QR with Logo</h3>
              <p className="text-stone-500 text-xs sm:text-sm leading-relaxed mb-6">
                Stand out with logo-embedded QR codes themed in your exact brand colors. Download high-resolution PNG &amp; vector SVG formats.
              </p>

              {/* Live interactive visual element: hover animates modules and pops logo */}
              <div className="h-28 bg-white border border-stone-200 rounded-xl p-3 flex items-center justify-center relative cursor-pointer overflow-hidden shadow-xs">
                <div className="absolute inset-0 bg-stone-50 opacity-0 group-hover:opacity-40 transition-opacity"></div>
                <div className="w-20 h-20 relative flex items-center justify-center">
                  <svg className="w-full h-full text-stone-300 group-hover:text-brand transition-colors duration-700 ease-in-out" viewBox="0 0 100 100" fill="currentColor">
                    {/* Finder patterns */}
                    <rect x="0" y="0" width="24" height="24" rx="2" />
                    <rect x="4" y="4" width="16" height="16" fill="white" />
                    <rect x="8" y="8" width="8" height="8" />

                    <rect x="76" y="0" width="24" height="24" rx="2" />
                    <rect x="80" y="4" width="16" height="16" fill="white" />
                    <rect x="84" y="8" width="8" height="8" />

                    <rect x="0" y="76" width="24" height="24" rx="2" />
                    <rect x="8" y="84" width="8" height="8" />
                    
                    {/* Small modules */}
                    <rect x="36" y="4" width="4" height="4" />
                    <rect x="44" y="0" width="8" height="4" />
                    <rect x="60" y="8" width="4" height="8" />
                    <rect x="28" y="16" width="8" height="4" />
                    <rect x="4" y="36" width="4" height="8" />
                    <rect x="40" y="28" width="4" height="8" />
                    <rect x="76" y="36" width="4" height="4" />
                    <rect x="84" y="44" width="8" height="4" />
                    <rect x="36" y="76" width="4" height="8" />
                    <rect x="44" y="84" width="8" height="4" />
                    <rect x="60" y="80" width="4" height="12" />
                  </svg>
                  
                  {/* Floating logo circle scaling in on hover */}
                  <div className="absolute w-6 h-6 bg-brand text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-md transform scale-0 group-hover:scale-100 transition-transform duration-500 ease-out delay-150">
                    QR
                  </div>
                </div>
                <div className="absolute bottom-1 right-2 text-[8px] font-semibold text-stone-400 group-hover:text-brand transition-colors">Hover to reveal logo</div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-stone-50 border border-stone-200/60 rounded-2xl p-6 hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-brand/10 text-brand rounded-xl flex items-center justify-center text-lg font-bold mb-4 shadow-sm">🏢</div>
              <h3 className="font-bold text-stone-900 text-base mb-2">Business-Type Profiles</h3>
              <p className="text-stone-500 text-xs sm:text-sm leading-relaxed">
                Whether you run a Restaurant (menu lists), a Hotel (amenities &amp; room service), or a Salon (service catalogues), we pre-load matching presets to build it quickly.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-stone-50 border border-stone-200/60 rounded-2xl p-6 hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-brand/10 text-brand rounded-xl flex items-center justify-center text-lg font-bold mb-4 shadow-sm">⭐</div>
              <h3 className="font-bold text-stone-900 text-base mb-2">Google Review Funnel</h3>
              <p className="text-stone-500 text-xs sm:text-sm leading-relaxed">
                Get more Google reviews using smart sentiment routing. Happy customers are sent directly to Google; unhappy ones submit feedback privately to your owner inbox.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-stone-50 border border-stone-200/60 rounded-2xl p-6 hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-brand/10 text-brand rounded-xl flex items-center justify-center text-lg font-bold mb-4 shadow-sm">💾</div>
              <h3 className="font-bold text-stone-900 text-base mb-2">Instant Save to Contacts</h3>
              <p className="text-stone-500 text-xs sm:text-sm leading-relaxed">
                Customers scan and tap to download your virtual contact card (vCard), instantly saving your name, phone, WhatsApp, and links to their address book.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-stone-50 border border-stone-200/60 rounded-2xl p-6 hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-brand/10 text-brand rounded-xl flex items-center justify-center text-lg font-bold mb-4 shadow-sm">♾️</div>
              <h3 className="font-bold text-stone-900 text-base mb-2">Lifetime Hosting, No Anxiety</h3>
              <p className="text-stone-500 text-xs sm:text-sm leading-relaxed">
                No monthly subscriptions or recurring stress. Make a single one-time payment and keep your digital card online for life with unlimited self-edits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Business-Type Showcase Strip */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-2">See it in action for your business</h2>
        <p className="text-stone-500 mb-12 max-w-md mx-auto text-sm">
          Browse real, live interactive profile mockups customized for different industry needs. Click any card to open the live demo.
        </p>

        {/* Scrollable phone mockups container */}
        <div className="flex overflow-x-auto gap-6 pb-8 scrollbar-none snap-x snap-mandatory scroll-smooth px-1">
          {[
            {
              emoji: "🍽️",
              type: "Restaurant",
              name: "The Himalayan Bistro",
              color: "#c0392b",
              desc: "Displays food categories, prices, items marked as popular, and a call-to-order button.",
              tab: "🍽️ Menu",
              slug: "demo-restaurant"
            },
            {
              emoji: "💆",
              type: "Salon & Spa",
              name: "Glow & Co. Salon",
              color: "#6c3483",
              desc: "Showcases standard price tables, duration, portfolio images, and booking appointments.",
              tab: "✂️ Services",
              slug: "demo-salon"
            },
            {
              emoji: "🏨",
              type: "Hotel & Stay",
              name: "Summit View Boutique",
              color: "#1a5276",
              desc: "Showcases custom room services, guest WiFi auto-connect QR, and resort amenities.",
              tab: "📍 Info / WiFi",
              slug: "demo-hotel"
            },
            {
              emoji: "📷",
              type: "Creative",
              name: "Studio Canvas",
              color: "#2c2c2c",
              desc: "Highlights grid portfolios, photography albums, packages, and calendar integrations.",
              tab: "📷 Gallery",
              slug: "demo-creative"
            },
            {
              emoji: "💼",
              type: "Consultancy",
              name: "Apex Advisory Group",
              color: "#2c3e50",
              desc: "Focuses on consultation request fields, lead capture boxes, and corporate office details.",
              tab: "📅 Book / Leads",
              slug: "demo-consultant"
            }
          ].map((item, idx) => (
            <Link
              key={idx}
              href={`/card/${item.slug}`}
              target="_blank"
              className="flex-shrink-0 w-[270px] bg-white border border-stone-200 rounded-3xl p-5 shadow-sm hover:shadow-lg hover:border-brand/35 transition-all text-left snap-center cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl">{item.emoji}</span>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{item.type}</span>
                </div>
                <h4 className="font-bold text-stone-900 text-sm truncate">{item.name}</h4>
                <p className="text-stone-500 text-xs mt-1.5 leading-relaxed min-h-[50px]">{item.desc}</p>
                
                {/* Mini mockup screen representation */}
                <div className="mt-4 bg-stone-50 rounded-xl p-3 border border-stone-200/50">
                  <div className="flex gap-1.5 overflow-x-auto pb-2 border-b border-stone-200/50 mb-2 scrollbar-none text-[8px] font-bold">
                    <span style={{ backgroundColor: item.color }} className="text-white px-2 py-0.5 rounded-lg">{item.tab}</span>
                    <span className="text-stone-400 bg-white border border-stone-150 px-2 py-0.5 rounded-lg">👤 About</span>
                    <span className="text-stone-400 bg-white border border-stone-150 px-2 py-0.5 rounded-lg">📞 Contact</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-2 bg-stone-200 rounded-full w-3/4"></div>
                    <div className="h-1.5 bg-stone-200 rounded-full w-1/2"></div>
                    <div className="h-1.5 bg-stone-200 rounded-full w-2/3"></div>
                  </div>
                </div>
              </div>
              <div className="mt-5 text-xs font-semibold text-brand hover:underline flex items-center gap-1">
                Open demo profile
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Social Proof & Testimonials Section */}
      <section className="bg-stone-100/60 border-y border-stone-200/60 py-20 text-center">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-brand/5 border border-brand/10 rounded-2xl py-3 px-6 w-fit mx-auto mb-10 text-xs sm:text-sm font-bold text-brand shadow-xs">
            🚀 Used by {paidCount > 0 ? `${paidCount} paid` : "several"} businesses across Nepal
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-12">Loved by local business owners</h2>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 text-left">
            {[
              {
                quote: "One-QR-Card replaced 4 physical card designs at our service. Now customers scan, save our number, and WhatsApp us in one go.",
                author: "Rohan Shakya",
                role: "Operations Head, Easymoto Ride Sharing"
              },
              {
                quote: "We printed one large QR code on our guest tables. Guests scan it to see our Thakali menu. We never print menus anymore!",
                author: "Deepak Thakali",
                role: "Owner, Bistro Thakali Kitchen"
              },
              {
                quote: "Our walk-in clients scan to auto-connect to the guest WiFi and book their next hair spa slot. Genuinely improves customer satisfaction.",
                author: "Anisha Gurung",
                role: "Director, Glow Spa & Salon"
              }
            ].map((t, idx) => (
              <div key={idx} className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed italic">&quot;{t.quote}&quot;</p>
                <div className="mt-4 pt-4 border-t border-stone-100">
                  <div className="font-bold text-stone-900 text-xs sm:text-sm">{t.author}</div>
                  <div className="text-[10px] text-stone-400 font-semibold mt-0.5">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-2">
          One-time payment. Lifetime hosting.
        </h2>
        <p className="text-stone-500 text-center mb-12 text-sm sm:text-base">
          No subscriptions, no hidden monthly charges. Pay once, use forever.
        </p>
        <PricingCards />
      </section>

      {/* Footer */}
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
