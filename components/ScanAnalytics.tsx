"use client";

import { useEffect, useState } from "react";
import { PlanId } from "@/lib/types";

interface ScanAnalyticsProps {
  cardId: string;
  plan: PlanId;
}

interface AnalyticsData {
  total: number;
  sparkline: number[];
  labels: string[];
}

export default function ScanAnalytics({ cardId, plan }: ScanAnalyticsProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (plan === "basic") {
      setLoading(false);
      return;
    }

    let active = true;
    fetch(`/api/cards/${cardId}/analytics`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch analytics");
        }
        return res.json();
      })
      .then((json) => {
        if (active) {
          setData(json);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || "Failed to load analytics");
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [cardId, plan]);

  if (plan === "basic") {
    return (
      <div className="bg-gradient-to-br from-stone-50 to-stone-100/50 border border-stone-200 rounded-2xl p-6 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-40 h-40 bg-purple-100/30 rounded-full blur-2xl"></div>
        <div className="space-y-1.5 relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 text-stone-600 rounded-full text-[10px] font-semibold border border-stone-200/50 uppercase tracking-wider">
            <span>🔒</span> <span>Standard & Lifetime Feature</span>
          </div>
          <h3 className="text-base font-bold text-stone-900">Unlock Live Scan Analytics</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            See how many clients view and scan your QR code. Get a 7-day interactive sparkline of daily activity to track your card's engagement and growth.
          </p>
        </div>
        <div className="relative z-10 shrink-0">
          <button
            onClick={() => {
              const el = document.getElementById("upgrade-section");
              if (el) {
                el.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-stone-950 hover:bg-stone-800 text-white font-medium rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
          >
            Upgrade to unlock
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm mb-8 animate-pulse">
        <div className="grid md:grid-cols-[200px_1fr] gap-6 items-center">
          <div className="space-y-2">
            <div className="h-3 w-20 bg-stone-200 rounded"></div>
            <div className="h-8 w-24 bg-stone-200 rounded"></div>
            <div className="h-3 w-36 bg-stone-200 rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-32 bg-stone-200 rounded"></div>
            <div className="h-16 w-full bg-stone-100 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return null; // Silent failure/no display if analytics API errors
  }

  // Calculate coordinates for sparkline SVG
  const sparkline = data.sparkline || [0, 0, 0, 0, 0, 0, 0];
  const maxVal = Math.max(...sparkline, 1);
  const w = 500;
  const h = 80;
  const paddingLeft = 20;
  const paddingRight = 20;
  const paddingTop = 15;
  const paddingBottom = 15;
  const gridW = w - paddingLeft - paddingRight;
  const gridH = h - paddingTop - paddingBottom;

  const points = sparkline.map((val, i) => {
    const x = paddingLeft + (i * gridW) / 6;
    const y = h - paddingBottom - (val / maxVal) * gridH;
    return { x, y, val };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const fillPath = `${linePath} L ${points[points.length - 1].x} ${h - paddingBottom} L ${points[0].x} ${h - paddingBottom} Z`;

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm mb-8">
      <div className="grid md:grid-cols-[200px_1fr] gap-8 items-center">
        {/* Left: Total Scans */}
        <div className="space-y-1">
          <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Total Scans</span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-stone-900 tracking-tight">
              {data.total}
            </span>
            <span className="text-[10px] text-brand hover:text-brand-hover font-semibold flex items-center bg-brand-light px-2 py-0.5 rounded-full border border-brand-ring/30">
              Live
            </span>
          </div>
          <p className="text-xs text-stone-500">Total views & scans in the last 7 days</p>
        </div>

        {/* Right: Sparkline Chart */}
        <div className="w-full">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Activity (last 7 days)</span>
            <span className="text-[10px] text-stone-400 font-medium bg-stone-50 px-2 py-0.5 rounded border border-stone-200/50">
              Peak: {Math.max(...sparkline)} scans
            </span>
          </div>

          <div className="relative pt-2">
            <svg viewBox={`0 0 ${w} ${h}`} className="w-full overflow-visible">
              <defs>
                <linearGradient id="sparkline-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Baseline */}
              <line
                x1={paddingLeft}
                y1={h - paddingBottom}
                x2={w - paddingRight}
                y2={h - paddingBottom}
                className="stroke-stone-100"
                strokeWidth="1.5"
              />

              {/* Fill area */}
              <path d={fillPath} fill="url(#sparkline-grad)" />

              {/* Sparkline path */}
              <path
                d={linePath}
                fill="none"
                stroke="#7c3aed"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Interactive Dots */}
              {points.map((p, i) => (
                <g key={i} className="group cursor-pointer">
                  {/* Tooltip background on hover */}
                  <rect
                    x={p.x - 16}
                    y={p.y - 25}
                    width="32"
                    height="18"
                    rx="4"
                    className="fill-stone-900 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                  />
                  {/* Tooltip text */}
                  <text
                    x={p.x}
                    y={p.y - 13}
                    textAnchor="middle"
                    className="text-[9px] fill-white font-bold font-sans opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                  >
                    {p.val}
                  </text>
                  {/* Outer glow circle */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="6"
                    className="fill-brand/20 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                  />
                  {/* Center circle */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="3.5"
                    className="fill-brand stroke-white"
                    strokeWidth="1.5"
                  />
                </g>
              ))}
            </svg>
            
            {/* Custom Day Labels beneath the SVG */}
            <div className="flex justify-between mt-1" style={{ paddingLeft: `${paddingLeft}px`, paddingRight: `${paddingRight}px` }}>
              {(data.labels || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]).map((label, i) => (
                <span key={i} className="text-[10px] text-stone-400 font-medium font-sans w-8 text-center">
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
