"use client";

import { useState } from "react";
import Link from "next/link";
import { PLAN_DETAILS, PlanId } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

interface FeatureRow {
  name: string;
  free: string | boolean;
  standard: string | boolean;
  lifetime: string | boolean;
}

const COMPARISON_FEATURES: FeatureRow[] = [
  { name: "Hosting Duration", free: "15 Days", standard: "Lifetime", lifetime: "Lifetime" },
  { name: "Card Allowance", free: "1 card", standard: "2 cards (1 primary + 1 team)", lifetime: "5 cards (1 primary + 4 team)" },
  { name: "Theme Selection", free: "Classic only", standard: "All standard themes", lifetime: "All themes (incl. Glassmorphism, Neon)" },
  { name: "Ads & Branding", free: "Watermark & Ads shown", standard: "No ads", lifetime: "No ads" },
  { name: "Subdomain", free: "/card/[slug] path", standard: "/card/[slug] (subdomain coming)", lifetime: "Custom subdomain coming soon" },
  { name: "Custom Background", free: "✕", standard: "✕", lifetime: "✓" },
  { name: "Custom Links", free: "✕", standard: "✕", lifetime: "✓ (Unlimited)" },
  { name: "Analytics Dashboard", free: "✕", standard: "✓ (Basic)", lifetime: "✓ (Advanced)" },
  { name: "Lead Capture Form", free: "✕", standard: "✕", lifetime: "✓" },
  { name: "Google Review Gate", free: "✕", standard: "✓", lifetime: "✓" },
  { name: "Wallet Pass (Apple/Google)", free: "✕", standard: "✕", lifetime: "✓" },
  { name: "Customer Support", free: "Email only", standard: "Standard support", lifetime: "Priority support (WhatsApp)" },
];

export default function PricingCards() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="w-full">
      {/* Cards Grid */}
      <div className="grid sm:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
        {/* Free Plan */}
        <motion.div
          whileHover={{ y: -6 }}
          transition={{ duration: 0.2 }}
          className="rounded-3xl p-8 border border-stone-200 bg-white flex flex-col justify-between shadow-sm"
        >
          <div>
            <div className="text-stone-400 font-bold text-xs uppercase tracking-wider mb-2">Start Here</div>
            <div className="text-stone-900 font-extrabold text-2xl mb-1">Free Trial</div>
            <div className="text-3xl font-extrabold text-stone-900 mt-2 mb-1">Rs 0</div>
            <div className="text-xs text-stone-400 mb-6">15 days, then read-only</div>
            <div className="h-px bg-stone-100 my-6" />
            <ul className="text-sm space-y-3.5 mb-6 text-stone-600">
              <li className="flex gap-2.5 items-start">
                <span className="text-brand font-bold">✓</span>
                <span>Classic theme only</span>
              </li>
              <li className="flex gap-2.5 items-start">
                <span className="text-brand font-bold">✓</span>
                <span>1 card allowance</span>
              </li>
              <li className="flex gap-2.5 items-start">
                <span className="text-stone-300">✕</span>
                <span className="text-stone-400 line-through">Custom subdomains</span>
              </li>
            </ul>
            <div className="text-[11px] text-stone-400 mb-6 italic">
              Free cards display a small &quot;Powered by One-QR-Card&quot; watermark
            </div>
          </div>
          <Link
            href="/create?plan=basic"
            className="block text-center py-3 rounded-xl font-semibold text-sm bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors w-full"
          >
            Start Free Trial
          </Link>
        </motion.div>

        {/* Pro Plan */}
        <motion.div
          whileHover={{ y: -6 }}
          transition={{ duration: 0.2 }}
          className="rounded-3xl p-8 border-2 border-brand bg-[#085041]/5 flex flex-col justify-between shadow-md relative"
        >
          {/* Most popular badge */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand text-white text-[10px] font-bold tracking-wider uppercase py-1 px-3.5 rounded-full shadow-sm">
            Most Popular
          </div>

          <div>
            <div className="text-brand font-bold text-xs uppercase tracking-wider mb-2 mt-1">Pro</div>
            <div className="text-4xl font-extrabold text-stone-900 mb-1">Rs 500 <span className="text-lg font-normal text-stone-400">/ $5</span></div>
            <div className="text-xs text-stone-500 font-medium mb-6">1 primary + 1 team card • Lifetime</div>
            <div className="h-px bg-stone-200/60 my-6" />
            <ul className="text-sm space-y-3.5 mb-8 text-stone-700">
              <li className="flex gap-2.5 items-start font-semibold text-brand">
                <span className="font-bold">✓</span>
                <span>Logo-embedded branded QR</span>
              </li>
              <li className="flex gap-2.5 items-start">
                <span className="text-brand font-bold">✓</span>
                <span>All standard themes included</span>
              </li>
              <li className="flex gap-2.5 items-start">
                <span className="text-brand font-bold">✓</span>
                <span>No ads or watermarks</span>
              </li>
              <li className="flex gap-2.5 items-start">
                <span className="text-brand font-bold">✓</span>
                <span>Google Review gate</span>
              </li>
            </ul>
          </div>
          <Link
            href="/create?plan=pro"
            className="block text-center py-3 rounded-xl font-semibold text-sm bg-brand text-white hover:bg-brand-hover transition-colors w-full shadow-sm"
          >
            Choose Pro
          </Link>
        </motion.div>

        {/* Business Plan */}
        <motion.div
          whileHover={{ y: -6 }}
          transition={{ duration: 0.2 }}
          className="rounded-3xl p-8 bg-stone-950 text-white flex flex-col justify-between shadow-lg relative overflow-hidden"
        >
          {/* For teams badge */}
          <div className="absolute top-4 right-4 bg-yellow-400 text-stone-950 text-[10px] font-black tracking-widest uppercase py-1 px-2.5 rounded-full shadow-sm">
            For Teams
          </div>
          
          <div>
            <div className="text-yellow-400 font-semibold text-xs uppercase tracking-wider mb-2">Business</div>
            <div className="text-4xl font-extrabold mb-1">Rs 1,000 <span className="text-lg font-normal opacity-70">/ $10</span></div>
            <div className="text-xs text-stone-400 mb-6">1 primary + 4 team cards • Lifetime</div>
            <div className="h-px bg-white/10 my-6" />
            <ul className="text-sm space-y-3.5 mb-8 opacity-95">
              <li className="flex gap-2.5 items-start font-semibold text-yellow-400">
                <span>✓</span>
                <span>Premium themes + full section library</span>
              </li>
              <li className="flex gap-2.5 items-start">
                <span>✓</span>
                <span>Custom subdomain coming soon</span>
              </li>
              <li className="flex gap-2.5 items-start">
                <span>✓</span>
                <span>Lead capture & advanced review gating</span>
              </li>
              <li className="flex gap-2.5 items-start">
                <span>✓</span>
                <span>Apple & Google Wallet pass</span>
              </li>
              <li className="flex gap-2.5 items-start text-xs opacity-75 italic">
                <span>↳</span>
                <span>QR link never changes, domain updates are seamless</span>
              </li>
            </ul>
          </div>
          <Link
            href="/create?plan=business"
            className="block text-center py-3 rounded-xl font-semibold text-sm bg-white text-stone-950 hover:bg-stone-100 transition-colors w-full shadow-md"
          >
            Choose Business
          </Link>
        </motion.div>
      </div>

      {/* Expandable Comparison Table */}
      <div className="mt-16 text-center max-w-4xl mx-auto">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-stone-200 hover:border-stone-300 rounded-full text-xs font-semibold text-stone-600 bg-white hover:bg-stone-50 transition-all cursor-pointer shadow-sm"
        >
          {expanded ? "Hide Plan Details" : "Compare Full Features"}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden mt-8 text-left bg-white rounded-3xl border border-stone-200 shadow-sm"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50/70 text-stone-500 font-semibold text-xs">
                      <th className="py-4 px-6 text-left">Feature</th>
                      <th className="py-4 px-6 text-center">Free Trial</th>
                      <th className="py-4 px-6 text-center">Pro</th>
                      <th className="py-4 px-6 text-center">Business</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {COMPARISON_FEATURES.map((feat, idx) => (
                      <tr key={idx} className="hover:bg-stone-50/40 transition-colors">
                        <td className="py-3.5 px-6 font-medium text-stone-900">{feat.name}</td>
                        <td className="py-3.5 px-6 text-center text-xs">
                          {feat.free === "✓" ? (
                            <span className="text-brand font-bold text-sm">✓</span>
                          ) : feat.free === "✕" ? (
                            <span className="text-stone-300 text-sm">✕</span>
                          ) : (
                            <span>{feat.free}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-6 text-center text-xs">
                          {feat.standard === "✓" ? (
                            <span className="text-brand font-bold text-sm">✓</span>
                          ) : feat.standard === "✕" ? (
                            <span className="text-stone-300 text-sm">✕</span>
                          ) : (
                            <span>{feat.standard}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-6 text-center text-xs font-semibold text-brand">
                          {feat.lifetime === "✓" ? (
                            <span className="text-brand font-bold text-sm">✓</span>
                          ) : feat.lifetime === "✕" ? (
                            <span className="text-stone-300 text-sm">✕</span>
                          ) : (
                            <span>{feat.lifetime}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
