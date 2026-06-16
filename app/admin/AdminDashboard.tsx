"use client";

import { useState } from "react";
import { CardData } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AdminDashboardProps {
  initialCards: CardData[];
  userEmail: string;
}

export default function AdminDashboard({ initialCards, userEmail }: AdminDashboardProps) {
  const router = useRouter();
  const [cards, setCards] = useState<CardData[]>(initialCards);
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState<"all" | "basic" | "pro" | "business">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "pending" | "pending_verification">("all");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDeleteCard(cardId: string, businessName: string) {
    if (!window.confirm(`Are you sure you want to delete the card for "${businessName}"? This cannot be undone.`)) {
      return;
    }
    setDeletingId(cardId);
    try {
      const res = await fetch(`/api/cards/${cardId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to delete card");
      }

      setCards((prev) => prev.filter((c) => c.id !== cardId));
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to delete card");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleUpdatePaymentStatus(cardId: string, newStatus: "paid" | "pending" | "pending_verification") {
    setTogglingId(cardId);
    try {
      const res = await fetch(`/api/admin/cards/${cardId}/toggle-payment`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_status: newStatus }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update payment status");
      }

      const updated = await res.json();
      setCards((prev) =>
        prev.map((c) => (c.id === cardId ? {
          ...c,
          payment_status: updated.card.payment_status,
          txn_id: updated.card.txn_id,
          sender_wallet: updated.card.sender_wallet,
        } : c))
      );
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to update card status");
    } finally {
      setTogglingId(null);
    }
  }


  // Filter cards based on search term and dropdown selections
  const filteredCards = cards.filter((card) => {
    const s = searchTerm.toLowerCase();
    const matchesSearch =
      card.business_name.toLowerCase().includes(s) ||
      card.slug.toLowerCase().includes(s) ||
      (card.owner_email && card.owner_email.toLowerCase().includes(s));

    const matchesPlan = planFilter === "all" || card.plan === planFilter;
    const matchesStatus = statusFilter === "all" || card.payment_status === statusFilter;

    return matchesSearch && matchesPlan && matchesStatus;
  });

  return (
    <main className="min-h-screen bg-stone-50 py-12 px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between sm:items-center pb-8 border-b border-stone-200 mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Admin Dashboard</h1>
            <p className="text-sm text-stone-500 mt-1">Logged in as system admin: {userEmail}</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/create"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm"
            >
              Create Card (Bypass Payment)
            </Link>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="text-sm font-semibold text-stone-600 hover:text-stone-900 border border-stone-200 hover:bg-stone-100 bg-white px-4 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        {/* Search & Filters */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 mb-8 shadow-sm flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
              Search Cards
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by business name, slug, or owner email..."
              className="input w-full"
            />
          </div>
          <div className="w-full md:w-48">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
              Plan
            </label>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value as any)}
              className="h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm outline-none focus:border-stone-500"
            >
              <option value="all">All Plans</option>
              <option value="basic">Basic (Free)</option>
              <option value="pro">Pro</option>
              <option value="business">Business</option>
            </select>
          </div>
          <div className="w-full md:w-48">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
              Payment Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm outline-none focus:border-stone-500"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Active (Paid)</option>
              <option value="pending_verification">Pending Verification</option>
              <option value="pending">Pending Payment</option>
            </select>
          </div>
        </div>

        {/* Cards Table */}
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
          {filteredCards.length === 0 ? (
            <div className="text-center py-12 text-stone-500 text-sm">
              No matching cards found in the system.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-200 text-xs uppercase tracking-wider">
                    <th className="py-4 px-6">Business Card</th>
                    <th className="py-4 px-6">Owner Email</th>
                    <th className="py-4 px-6">Plan</th>
                    <th className="py-4 px-6">Payment Status</th>
                    <th className="py-4 px-6">Created Date</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredCards.map((card) => (
                    <tr key={card.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-stone-900">{card.business_name}</div>
                        <div className="text-xs text-stone-400 font-mono mt-0.5">
                          slug: {card.slug}
                        </div>
                        <a
                          href={`/card/${card.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-stone-400 hover:text-stone-900 underline mt-1 inline-block"
                        >
                          View Card
                        </a>
                      </td>
                      <td className="py-4 px-6 text-stone-600 font-medium">
                        {card.owner_email || <span className="italic text-stone-400">None</span>}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider border ${
                          card.plan === "business"
                            ? "bg-purple-50 text-purple-700 border-purple-100"
                            : card.plan === "pro"
                            ? "bg-blue-50 text-blue-700 border-blue-100"
                            : "bg-stone-50 text-stone-600 border-stone-200"
                        }`}>
                          {card.plan}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                              card.payment_status === "paid"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : card.payment_status === "pending_verification"
                                ? "bg-amber-100 text-amber-800 border-amber-200 animate-pulse"
                                : "bg-stone-50 text-stone-500 border-stone-200"
                            }`}>
                              {card.payment_status === "paid"
                                ? "Active"
                                : card.payment_status === "pending_verification"
                                ? "Pending Verification"
                                : "Pending"}
                            </span>
                          </div>

                          {card.payment_status === "pending_verification" && (
                            <div className="text-xs bg-stone-50 border border-stone-200 p-2.5 rounded-xl space-y-1 max-w-[240px]">
                              <div>
                                <span className="font-semibold text-stone-500">Txn ID:</span>{" "}
                                <span className="font-mono text-stone-800 bg-stone-100 px-1 py-0.5 rounded text-[11px] font-bold select-all">
                                  {card.txn_id || "N/A"}
                                </span>
                              </div>
                              <div>
                                <span className="font-semibold text-stone-500">Sender:</span>{" "}
                                <span className="text-stone-800 font-medium">{card.sender_wallet || "N/A"}</span>
                              </div>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {card.payment_status === "pending_verification" ? (
                              <>
                                <button
                                  onClick={() => handleUpdatePaymentStatus(card.id!, "paid")}
                                  disabled={togglingId === card.id}
                                  className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
                                >
                                  {togglingId === card.id ? "Processing..." : "Approve"}
                                </button>
                                <button
                                  onClick={() => handleUpdatePaymentStatus(card.id!, "pending")}
                                  disabled={togglingId === card.id}
                                  className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-white border border-red-200 text-red-600 hover:bg-red-50 transition-all cursor-pointer disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              </>
                            ) : card.payment_status === "paid" ? (
                              <button
                                onClick={() => handleUpdatePaymentStatus(card.id!, "pending")}
                                disabled={togglingId === card.id}
                                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50 transition-all cursor-pointer disabled:opacity-50"
                              >
                                {togglingId === card.id ? "Updating..." : "Deactivate"}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUpdatePaymentStatus(card.id!, "paid")}
                                disabled={togglingId === card.id}
                                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-all cursor-pointer disabled:opacity-50"
                              >
                                {togglingId === card.id ? "Updating..." : "Activate (Cash)"}
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-stone-500 text-xs">
                        {card.created_at ? new Date(card.created_at).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }) : "-"}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/edit/${card.id}`}
                            className="text-stone-700 hover:text-stone-900 border border-stone-200 rounded-lg px-3 py-1.5 text-xs font-semibold hover:bg-stone-50 transition-colors inline-block"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteCard(card.id!, card.business_name)}
                            disabled={deletingId === card.id}
                            className="text-red-600 hover:text-red-700 border border-red-200 rounded-lg px-3 py-1.5 text-xs font-semibold hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {deletingId === card.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
