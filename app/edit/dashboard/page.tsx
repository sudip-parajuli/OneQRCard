import { createServerSupabase } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CardData } from "@/lib/types";

export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = createServerSupabase();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/edit");
  }

  // Fetch all cards belonging to the logged-in owner
  const { data: cards, error } = await supabase
    .from("cards")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Dashboard page cards query error:", error);
  }

  const userCards = (cards || []) as CardData[];

  // If user has exactly one card, redirect to its edit page
  if (userCards.length === 1) {
    redirect(`/edit/${userCards[0].id}`);
  }

  return (
    <main className="min-h-screen bg-stone-50 py-12 px-6 lg:px-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center pb-8 border-b border-stone-200 mb-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Your Cards</h1>
            <p className="text-sm text-stone-500 mt-1">Logged in as {session.user.email}</p>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="text-sm font-semibold text-stone-600 hover:text-stone-900 underline transition-colors cursor-pointer"
            >
              Sign out
            </button>
          </form>
        </header>

        {userCards.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-stone-900 mb-2">No cards found</h2>
            <p className="text-stone-500 text-sm mb-6 max-w-md mx-auto">
              We couldn't find any digital cards associated with your email. If you just made a purchase, it might take a few moments to sync, or you can create one now.
            </p>
            <Link
              href="/create"
              className="inline-block bg-stone-900 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-stone-800 transition-colors"
            >
              Create a card
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {userCards.map((card) => (
              <div
                key={card.id}
                className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-lg font-semibold text-stone-900">{card.business_name}</h2>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        card.payment_status === "paid"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : "bg-amber-50 text-amber-700 border border-amber-100"
                      }`}
                    >
                      {card.payment_status === "paid" ? "Active" : "Pending Payment"}
                    </span>
                  </div>
                  {card.tagline && <p className="text-xs text-stone-500 mb-4 line-clamp-2">{card.tagline}</p>}
                  <p className="text-[11px] text-stone-400 font-mono mb-6">
                    {card.plan.toUpperCase()} • {card.subdomain ? `${card.subdomain}.yourcard.app` : `yourcard.app/card/${card.slug}`}
                  </p>
                </div>
                <div className="flex gap-3 mt-auto">
                  <Link
                    href={`/edit/${card.id}`}
                    className="flex-1 text-center py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors"
                  >
                    Edit Card
                  </Link>
                  {card.payment_status === "paid" && (
                    <a
                      href={card.subdomain ? `https://${card.subdomain}.yourcard.app` : `/card/${card.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center py-2.5 border border-stone-200 hover:bg-stone-50 rounded-xl text-xs font-semibold text-stone-700 transition-colors"
                    >
                      View Live
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
