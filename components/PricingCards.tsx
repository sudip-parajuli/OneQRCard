"use client";

import { useState } from "react";
import Link from "next/link";
import { PLAN_DETAILS } from "@/lib/types";

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
  { name: "Analytics Dashboard", free: "✕", standard: "Coming soon", lifetime: "Coming soon" },
  { name: "Lead Capture Form", free: "✕", standard: "✕", lifetime: "✓" },
  { name: "Google Review Gate", free: "✕", standard: "✓", lifetime: "✓" },
  { name: "Wallet Pass (Apple/Google)", free: "✕", standard: "✕", lifetime: "Coming soon" },
  { name: "Customer Support", free: "Email only", standard: "Standard support", lifetime: "Priority support (WhatsApp)" },
];

export default function PricingCards() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="w-full">
      {/* Cards Grid */}
      <div className="grid sm:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
        
        {/* FREE TRIAL */}
        <div className="rounded-3xl p-8 border border-stone-200 bg-white flex flex-col justify-between shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <div>
            <div className="text-stone-900 font-extrabold text-2xl mb-1">Free Trial</div>
            <div className="text-3xl font-extrabold text-stone-900 mt-2 mb-1">Rs 0 <span className="text-sm font-normal text-stone-400">/ 15 days</span></div>
            <div className="text-xs text-stone-500 font-medium mb-6">Expires after 15 days — upgrade anytime</div>
            
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
                <span className="text-brand font-bold">✓</span>
                <span>Standard contact options</span>
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
          <div>
            <Link
              href="/create?plan=basic"
              className="block text-center py-3 rounded-xl font-semibold text-sm bg-stone-100 text-stone-700 hover:bg-stone-250 transition-colors w-full"
            >
              Start for free
            </Link>
            <div className="text-center text-[10px] text-stone-400 mt-2">
              No credit card required
            </div>
          </div>
        </div>

        {/* PRO */}
        <div className="rounded-3xl p-8 border-2 border-brand bg-white flex flex-col justify-between shadow-md relative transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
          {/* Most popular badge ABOVE the card */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand text-white text-[10px] font-bold tracking-wider uppercase py-1 px-4 rounded-full shadow-sm">
            Most Popular
          </div>

          <div>
            <div className="text-brand font-bold text-xs uppercase tracking-wider mb-2 mt-1">Pro</div>
            <div className="text-4xl font-extrabold text-stone-900 mb-1">Rs 500 <span className="text-lg font-normal text-stone-450">/ $5</span></div>
            <div className="text-xs text-stone-500 font-medium mb-6">One-time · Lifetime hosting</div>
            
            <div className="h-px bg-stone-250/60 my-6" />
            
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
              <li className="flex gap-2.5 items-start">
                <span className="text-brand font-bold">✓</span>
                <span>2 card slots (1 primary + 1 team)</span>
              </li>
            </ul>
          </div>
          <Link
            href="/create?plan=pro"
            className="block text-center py-3 rounded-xl font-semibold text-sm bg-brand text-white hover:bg-brand-hover transition-colors w-full shadow-sm"
          >
            Choose Pro
          </Link>
        </div>

        {/* BUSINESS */}
        <div className="rounded-3xl p-8 bg-stone-950 text-white flex flex-col justify-between shadow-lg relative overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl">
          {/* Subtle top accent line */}
          <div className="absolute top-0 inset-x-0 h-1 bg-brand rounded-t-3xl"></div>

          <div>
            <div className="text-brand font-semibold text-xs uppercase tracking-wider mb-2 mt-1">Business</div>
            <div className="text-4xl font-extrabold mb-1">Rs 1,000 <span className="text-lg font-normal text-stone-400">/ $10</span></div>
            <div className="text-xs text-stone-400 mb-6">One-time · Lifetime · 5 card slots</div>
            
            <div className="h-px bg-white/10 my-6" />
            
            <ul className="text-sm space-y-3.5 mb-8 opacity-95">
              <li className="flex gap-2.5 items-start font-semibold text-brand">
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
              <li className="flex gap-2.5 items-start">
                <span>✓</span>
                <span>5 card slots (1 primary + 4 team)</span>
              </li>
            </ul>
          </div>
          <Link
            href="/create?plan=business"
            className="block text-center py-3 rounded-xl font-semibold text-sm bg-white text-stone-950 hover:bg-stone-100 transition-colors w-full shadow-md"
          >
            Choose Business
          </Link>
        </div>

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

        {expanded && (
          <div className="overflow-hidden mt-8 text-left bg-white rounded-3xl border border-stone-200 shadow-sm animate-fade-in">
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
          </div>
        )}
      </div>
    </div>
  );
}
