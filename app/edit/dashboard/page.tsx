import { createServerSupabase } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CardData } from "@/lib/types";
import { syncUserWorkspaces } from "@/lib/workspace";
import CardPreview from "@/components/CardPreview";

export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/edit");
  }

  const userEmail = user.email || "";

  // 1. Run self-healing sync to link cards to workspaces
  await syncUserWorkspaces(userEmail);

  // 2. Fetch workspaces owned by the user
  const { data: workspaces, error: wsError } = await supabase
    .from("workspaces")
    .select("*")
    .eq("owner_email", userEmail)
    .order("created_at", { ascending: false });

  if (wsError) {
    console.error("Dashboard workspaces query error:", wsError);
  }

  // 3. Fetch all cards owned by the user
  const { data: cards, error: cardsError } = await supabase
    .from("cards")
    .select("*")
    .eq("owner_email", userEmail)
    .order("created_at", { ascending: false });

  if (cardsError) {
    console.error("Dashboard cards query error:", cardsError);
  }

  const wsList = workspaces || [];
  const cardList = (cards || []) as CardData[];

  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || "allscan.app";

  // Fetch stats for all user's cards
  const cardIds = cardList.map((c) => c.id).filter((id): id is string => !!id);
  
  let totalScans = 0;
  let totalLeads = 0;
  let totalBookings = 0;
  let totalFeedback = 0;
  
  // Card-specific counters
  const cardStats: Record<string, { scans: number; leads: number; bookings: number; feedback: number }> = {};
  
  if (cardIds.length > 0) {
    const [scansRes, leadsRes, bookingsRes, feedbackRes] = await Promise.all([
      supabase.from("scans").select("card_id"),
      supabase.from("leads").select("card_id"),
      supabase.from("booking_requests").select("card_id"),
      supabase.from("feedback").select("card_id"),
    ]);

    // Initialize map
    cardIds.forEach((id) => {
      cardStats[id] = { scans: 0, leads: 0, bookings: 0, feedback: 0 };
    });

    if (scansRes.data) {
      totalScans = scansRes.data.length;
      scansRes.data.forEach((item: any) => {
        if (cardStats[item.card_id]) cardStats[item.card_id].scans++;
      });
    }

    if (leadsRes.data) {
      totalLeads = leadsRes.data.length;
      leadsRes.data.forEach((item: any) => {
        if (cardStats[item.card_id]) cardStats[item.card_id].leads++;
      });
    }

    if (bookingsRes.data) {
      totalBookings = bookingsRes.data.length;
      bookingsRes.data.forEach((item: any) => {
        if (cardStats[item.card_id]) cardStats[item.card_id].bookings++;
      });
    }

    if (feedbackRes.data) {
      totalFeedback = feedbackRes.data.length;
      feedbackRes.data.forEach((item: any) => {
        if (cardStats[item.card_id]) cardStats[item.card_id].feedback++;
      });
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 py-12 px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-8 border-b border-stone-200 mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-stone-900">Workspace Dashboard</h1>
            <p className="text-xs text-stone-450 mt-1 max-w-lg leading-relaxed">
              Manage your unified digital profiles. Consolidate your menus, contact details, social links, and Google review codes into one single branded QR code.
            </p>
            <p className="text-xs text-stone-500 mt-1.5">Logged in as <span className="font-semibold text-stone-700">{userEmail}</span></p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-semibold text-stone-600 hover:text-stone-950 bg-white border border-stone-200 px-3 py-2 rounded-xl transition-all shadow-sm"
            >
              Home
            </Link>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl transition-all cursor-pointer shadow-sm"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        {/* Combined Stats Summary */}
        {cardList.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">Total Scans</span>
              <p className="text-xl sm:text-2xl font-bold text-stone-900 mt-1">👁️ {totalScans}</p>
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">Leads Collected</span>
              <p className="text-xl sm:text-2xl font-bold text-stone-900 mt-1">👤 {totalLeads}</p>
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">Bookings Recieved</span>
              <p className="text-xl sm:text-2xl font-bold text-stone-900 mt-1">📅 {totalBookings}</p>
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">Customer Feedback</span>
              <p className="text-xl sm:text-2xl font-bold text-stone-900 mt-1">💬 {totalFeedback}</p>
            </div>
          </div>
        )}

        {wsList.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 shadow-sm max-w-xl mx-auto">
            <div className="w-16 h-16 bg-brand-light text-brand rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              +
            </div>
            <h2 className="text-xl font-bold text-stone-900 mb-2">Create your first card</h2>
            <p className="text-stone-500 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
              You don&apos;t have any active workspaces or digital cards yet. Create your card today to get started!
            </p>
            <Link
              href="/create"
              className="inline-block bg-brand hover:bg-brand-hover text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors shadow-sm"
            >
              Create a card
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {wsList.map((ws) => {
              const wsCards = cardList.filter((c) => c.workspace_id === ws.id);
              const primaryCard = wsCards.find((c) => c.is_primary) || wsCards[0];
              const teamCards = wsCards.filter((c) => c.id !== primaryCard?.id);
              
              const planLabel = ws.plan === "business" ? "Lifetime" : ws.plan === "pro" ? "Standard" : "Free";
              const planColor =
                ws.plan === "business"
                  ? "bg-purple-100 text-purple-800 border-purple-200"
                  : ws.plan === "pro"
                  ? "bg-blue-100 text-blue-800 border-blue-200"
                  : "bg-stone-100 text-stone-800 border-stone-200";

              return (
                <div
                  key={ws.id}
                  className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm"
                >
                  {/* Workspace Header */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-stone-100 mb-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-stone-900">
                          {primaryCard ? primaryCard.business_name : "Untitled Workspace"}
                        </h2>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${planColor}`}>
                          {planLabel} Tier
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 mt-1 font-mono">
                        Workspace ID: {ws.id}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-medium text-stone-500">
                      <div>
                        Cards: <span className="font-semibold text-stone-800">{wsCards.length}</span> of <span className="font-semibold text-stone-800">{ws.card_limit}</span>
                      </div>
                      <div className="h-4 w-px bg-stone-200" />
                      <div className="flex items-center gap-1.5">
                        Status:{" "}
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            ws.payment_status === "paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {ws.payment_status === "paid" ? "Active" : "Pending Verification"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Cards Grid */}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Primary Card */}
                    {primaryCard && (
                      <div className="flex flex-col justify-between border border-stone-200/80 rounded-2xl p-5 hover:shadow-md transition-all duration-200 bg-stone-50/20">
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-brand bg-brand-light px-2 py-0.5 rounded-md">
                              Primary Card
                            </span>
                            <span className="text-[10px] text-stone-400 font-mono">
                              {primaryCard.slug}.{baseDomain}
                            </span>
                          </div>

                          {/* Scaled-down live preview */}
                          <div className="relative overflow-hidden w-full h-[200px] rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-center group mb-4 shadow-sm">
                            <div className="absolute top-0 origin-top scale-[0.48] w-[208%] h-[208%] pointer-events-none transition-transform duration-300 group-hover:scale-[0.5]">
                              <CardPreview data={primaryCard} onSaveContact={() => {}} />
                            </div>
                            <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <Link
                                href={`/edit/${primaryCard.id}`}
                                className="bg-white text-stone-950 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-stone-50 shadow transition-transform scale-95 group-hover:scale-100 duration-200"
                              >
                                Edit Details
                              </Link>
                              {primaryCard.payment_status === "paid" && (
                                <a
                                  href={`/card/${primaryCard.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-brand text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-brand-hover shadow transition-transform scale-95 group-hover:scale-100 duration-200"
                                >
                                  View Live
                                </a>
                              )}
                            </div>
                          </div>

                          <h3 className="font-bold text-stone-850 text-sm truncate">{primaryCard.member_name || primaryCard.business_name}</h3>
                          {primaryCard.member_role && <p className="text-xs text-stone-400 mt-0.5">{primaryCard.member_role}</p>}
                          
                          {/* Card Statistics Quick View */}
                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[11px] text-stone-500 mt-3 pt-3 border-t border-stone-100">
                            <span className="flex items-center gap-1">👁️ <strong>{cardStats[primaryCard.id as string]?.scans || 0}</strong> scans</span>
                            <span className="w-1 h-1 bg-stone-300 rounded-full" />
                            <span className="flex items-center gap-1">👤 <strong>{cardStats[primaryCard.id as string]?.leads || 0}</strong> leads</span>
                            <span className="w-1 h-1 bg-stone-300 rounded-full" />
                            <span className="flex items-center gap-1">📅 <strong>{cardStats[primaryCard.id as string]?.bookings || 0}</strong> bookings</span>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4 pt-4 border-t border-stone-100">
                          <Link
                            href={`/edit/${primaryCard.id}`}
                            className="flex-1 text-center py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold transition-colors"
                          >
                            Edit
                          </Link>
                          {primaryCard.payment_status === "paid" && (
                            <a
                              href={`/card/${primaryCard.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 text-center py-2 border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-lg text-xs font-semibold transition-colors"
                            >
                              View
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Team Cards */}
                    {teamCards.map((card) => (
                      <div key={card.id} className="flex flex-col justify-between border border-stone-200/80 rounded-2xl p-5 hover:shadow-md transition-all duration-200 bg-stone-50/20">
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                              Team Member
                            </span>
                            <span className="text-[10px] text-stone-400 font-mono">
                              /card/{card.slug}
                            </span>
                          </div>

                          {/* Scaled-down live preview */}
                          <div className="relative overflow-hidden w-full h-[200px] rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-center group mb-4 shadow-sm">
                            <div className="absolute top-0 origin-top scale-[0.48] w-[208%] h-[208%] pointer-events-none transition-transform duration-300 group-hover:scale-[0.5]">
                              <CardPreview data={card} onSaveContact={() => {}} />
                            </div>
                            <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <Link
                                href={`/edit/${card.id}`}
                                className="bg-white text-stone-955 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-stone-50 shadow transition-transform scale-95 group-hover:scale-100 duration-200"
                              >
                                Edit Details
                              </Link>
                              {card.payment_status === "paid" && (
                                <a
                                  href={`/card/${card.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-brand text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-brand-hover shadow transition-transform scale-95 group-hover:scale-100 duration-200"
                                >
                                  View Live
                                </a>
                              )}
                            </div>
                          </div>

                          <h3 className="font-bold text-stone-850 text-sm truncate">{card.member_name || "Untitled Teammate"}</h3>
                          {card.member_role && <p className="text-xs text-stone-400 mt-0.5">{card.member_role}</p>}
                          
                          {/* Card Statistics Quick View */}
                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[11px] text-stone-500 mt-3 pt-3 border-t border-stone-100">
                            <span className="flex items-center gap-1">👁️ <strong>{cardStats[card.id as string]?.scans || 0}</strong> scans</span>
                            <span className="w-1 h-1 bg-stone-300 rounded-full" />
                            <span className="flex items-center gap-1">👤 <strong>{cardStats[card.id as string]?.leads || 0}</strong> leads</span>
                            <span className="w-1 h-1 bg-stone-300 rounded-full" />
                            <span className="flex items-center gap-1">📅 <strong>{cardStats[card.id as string]?.bookings || 0}</strong> bookings</span>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4 pt-4 border-t border-stone-100">
                          <Link
                            href={`/edit/${card.id}`}
                            className="flex-1 text-center py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold transition-colors"
                          >
                            Edit
                          </Link>
                          {card.payment_status === "paid" && (
                            <a
                              href={`/card/${card.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 text-center py-2 border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-lg text-xs font-semibold transition-colors"
                            >
                              View
                            </a>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Empty Slots */}
                    {wsCards.length < ws.card_limit && (
                      <Link
                        href={`/create?workspaceId=${ws.id}`}
                        className="flex flex-col items-center justify-center border-2 border-dashed border-stone-200 hover:border-brand/40 bg-stone-50/30 hover:bg-stone-50/80 rounded-2xl p-6 text-center transition-all min-h-[300px] cursor-pointer group"
                      >
                        <div className="w-12 h-12 rounded-full bg-white border border-stone-200 text-stone-400 group-hover:text-brand group-hover:border-brand/30 flex items-center justify-center font-bold text-lg shadow-sm transition-colors mb-3">
                          +
                        </div>
                        <h4 className="font-bold text-stone-800 text-sm group-hover:text-brand transition-colors">
                          Add Team Card
                        </h4>
                        <p className="text-xs text-stone-400 mt-1 max-w-[180px]">
                          Add a new teammate card. Bypasses plan selection and payment.
                        </p>
                      </Link>
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
