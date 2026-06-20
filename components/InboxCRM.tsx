"use client";

import { useEffect, useState } from "react";
import { PlanId } from "@/lib/types";

interface InboxCRMProps {
  cardId: string;
  plan: PlanId;
}

export default function InboxCRM({ cardId, plan }: InboxCRMProps) {
  const [data, setData] = useState<{
    leads: any[];
    feedback: any[];
    bookings: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"bookings" | "leads" | "feedback">("bookings");

  const isBusiness = plan === "business";

  useEffect(() => {
    if (!isBusiness || !cardId) return;

    let active = true;
    setLoading(true);
    setError(null);

    fetch(`/api/cards/${cardId}/inbox`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch inbox records");
        return res.json();
      })
      .then((resData) => {
        if (active) {
          setData(resData);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (active) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [cardId, isBusiness]);

  if (!isBusiness) {
    return (
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center max-w-6xl mx-auto my-6">
        <span className="text-3xl mb-2">🔒</span>
        <h3 className="font-bold text-stone-900 text-sm">Owner Inbox CRM Locked</h3>
        <p className="text-xs text-stone-500 mt-1 max-w-md leading-relaxed">
          The leads inbox, built-in appointment scheduler, and customer private feedback center are exclusive to the <strong className="text-stone-900">Business (Lifetime) Plan</strong>.
        </p>
        <a
          href="#upgrade-section"
          className="mt-4 bg-brand text-white font-semibold text-xs py-2 px-4 rounded-xl shadow hover:opacity-95 transition-opacity"
        >
          Upgrade Card to Unlock CRM
        </a>
      </div>
    );
  }

  const bookings = data?.bookings || [];
  const leads = data?.leads || [];
  const feedback = data?.feedback || [];

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm max-w-6xl mx-auto my-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-150 pb-4">
        <div>
          <h2 className="font-bold text-stone-900 text-base flex items-center gap-1.5">
            <span>📬</span> Owner Inbox &amp; CRM
          </h2>
          <p className="text-stone-500 text-xs mt-0.5">Track and manage booking requests, customer leads, and customer feedback submissions.</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-stone-100 p-1 rounded-xl text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "bookings" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-800"
            }`}
          >
            Bookings ({loading ? "..." : bookings.length})
          </button>
          <button
            onClick={() => setActiveTab("leads")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "leads" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-800"
            }`}
          >
            Leads ({loading ? "..." : leads.length})
          </button>
          <button
            onClick={() => setActiveTab("feedback")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "feedback" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-800"
            }`}
          >
            Feedback ({loading ? "..." : feedback.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-stone-400">
          <svg className="animate-spin h-6 w-6 text-stone-400 mb-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-xs">Loading inbox submissions...</span>
        </div>
      ) : error ? (
        <p className="text-center py-6 text-xs text-red-500 font-semibold">⚠️ {error}</p>
      ) : (
        <div className="overflow-x-auto">
          {activeTab === "bookings" && (
            bookings.length === 0 ? (
              <p className="text-center py-8 text-xs text-stone-400">No booking requests received yet.</p>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-400 uppercase font-semibold text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Customer Name</th>
                    <th className="py-2.5 px-3">Phone</th>
                    <th className="py-2.5 px-3">Requested Date/Time</th>
                    <th className="py-2.5 px-3">Service</th>
                    <th className="py-2.5 px-3">Submitted At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-stone-50/50">
                      <td className="py-3 px-3 font-semibold text-stone-850">{b.customer_name}</td>
                      <td className="py-3 px-3">
                        <a href={`tel:${b.customer_phone}`} className="hover:underline text-brand font-medium">
                          {b.customer_phone}
                        </a>
                      </td>
                      <td className="py-3 px-3 font-medium">{b.preferred_datetime}</td>
                      <td className="py-3 px-3">
                        {b.service_requested ? (
                          <span className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-medium">
                            {b.service_requested}
                          </span>
                        ) : (
                          <span className="text-stone-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-stone-400">
                        {new Date(b.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}

          {activeTab === "leads" && (
            leads.length === 0 ? (
              <p className="text-center py-8 text-xs text-stone-400">No contact leads captured yet.</p>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-400 uppercase font-semibold text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Phone</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Message</th>
                    <th className="py-2.5 px-3">Submitted At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {leads.map((l) => (
                    <tr key={l.id} className="hover:bg-stone-50/50">
                      <td className="py-3 px-3 font-semibold text-stone-850">{l.name}</td>
                      <td className="py-3 px-3">
                        {l.phone ? (
                          <a href={`tel:${l.phone}`} className="hover:underline text-brand font-medium">
                            {l.phone}
                          </a>
                        ) : (
                          <span className="text-stone-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {l.email ? (
                          <a href={`mailto:${l.email}`} className="hover:underline text-brand font-medium">
                            {l.email}
                          </a>
                        ) : (
                          <span className="text-stone-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-stone-600 max-w-xs truncate" title={l.message}>
                        {l.message || <span className="text-stone-400">—</span>}
                      </td>
                      <td className="py-3 px-3 text-stone-400">
                        {new Date(l.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}

          {activeTab === "feedback" && (
            feedback.length === 0 ? (
              <p className="text-center py-8 text-xs text-stone-400">No negative feedback logged yet.</p>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-400 uppercase font-semibold text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Rating</th>
                    <th className="py-2.5 px-3">Private Comments</th>
                    <th className="py-2.5 px-3">Submitted At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {feedback.map((f) => (
                    <tr key={f.id} className="hover:bg-stone-50/50">
                      <td className="py-3 px-3 font-semibold">
                        <span className="text-lg">🙁</span> <span className="text-red-500 uppercase text-[9px] tracking-wider font-bold">Unhappy</span>
                      </td>
                      <td className="py-3 px-3 text-stone-700 font-medium leading-relaxed max-w-sm" style={{ whiteSpace: "pre-line" }}>
                        {f.comments}
                      </td>
                      <td className="py-3 px-3 text-stone-400">
                        {new Date(f.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </div>
      )}
    </div>
  );
}
