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
  const primaryCards = userCards.filter((c) => !c.parent_id);
  const teamCards = userCards.filter((c) => c.parent_id);

  // Auto-redirect to edit page only if they have exactly 1 card AND it's on the basic plan
  if (userCards.length === 1 && userCards[0].plan === "basic") {
    redirect(`/edit/${userCards[0].id}`);
  }

  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || "yourcard.app";

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

        {primaryCards.length === 0 ? (
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
            {primaryCards.map((card) => {
              const myTeamCards = teamCards.filter((tc) => tc.parent_id === card.id);
              const maxTeamSlots = card.plan === "pro" ? 1 : card.plan === "business" ? 4 : 0;

              return (
                <div
                  key={card.id}
                  className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-lg font-semibold text-stone-900">
                        {card.member_name ? `${card.member_name} (${card.business_name})` : card.business_name}
                      </h2>
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
                      {card.plan.toUpperCase()} • {baseDomain}/card/{card.slug}
                    </p>

                    {/* Team Members Slots Section */}
                    {card.payment_status === "paid" && maxTeamSlots > 0 && (
                      <div className="mt-4 pt-4 border-t border-stone-100 mb-6">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                            Team Cards ({myTeamCards.length} of {maxTeamSlots})
                          </span>
                          <span className="text-[10px] text-stone-400 font-medium">
                            {maxTeamSlots - myTeamCards.length} slots left
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          {myTeamCards.map((member) => (
                            <div
                              key={member.id}
                              className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/50 flex justify-between items-center text-xs"
                            >
                              <div>
                                <div className="font-semibold text-stone-800">
                                  {member.member_name || member.business_name}
                                </div>
                                {member.member_role && (
                                  <div className="text-[10px] text-stone-400 mt-0.5">{member.member_role}</div>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Link
                                  href={`/edit/${member.id}`}
                                  className="text-stone-600 hover:text-stone-900 underline font-semibold"
                                >
                                  Edit
                                </Link>
                                <a
                                  href={`/card/${member.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-stone-600 hover:text-stone-900 underline font-semibold"
                                >
                                  View
                                </a>
                              </div>
                            </div>
                          ))}

                          {/* Remaining empty slots styled as interactive boxes */}
                          {Array.from({ length: maxTeamSlots - myTeamCards.length }).map((_, index) => (
                            <Link
                              key={`empty-${index}`}
                              href={`/create?parent_id=${card.id}`}
                              className="border border-dashed border-stone-300 hover:border-stone-400 bg-stone-50/50 hover:bg-stone-50 p-2.5 rounded-xl flex items-center justify-between text-xs text-stone-500 transition-all cursor-pointer group"
                            >
                              <span className="font-medium group-hover:text-stone-700">Empty Team Slot</span>
                              <span className="text-[10px] text-stone-400 font-bold bg-white px-2 py-0.5 rounded border border-stone-250 group-hover:border-stone-300">+ Add Card</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
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
                        href={`/card/${card.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center py-2.5 border border-stone-200 hover:bg-stone-50 rounded-xl text-xs font-semibold text-stone-700 transition-colors"
                      >
                        View Live
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
