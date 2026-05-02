"use client";
import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { SessionCard, SessionCardSkeleton } from "@/components/sessions/SessionCard";
import SessionService from "@/services/session.service";
import { useQuery } from "@tanstack/react-query";

const SPORTS = ["All", "HIIT", "Boxing", "MMA", "Yoga", "Gymnastics"];
const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
];

export default function SessionsClient() {
  const searchParams = useSearchParams();
  const defaultSport = searchParams.get("sport") || "All";
  const cap = defaultSport.charAt(0).toUpperCase() + defaultSport.slice(1);

  // --- States ---
  const [search, setSearch] = useState("");
  const [sport, setSport] = useState(cap === "All" ? "All" : cap);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [sortBy, setSortBy] = useState("popular");
  const [page, setPage] = useState(1);
  const PER_PAGE = 9;

  // Re-syncing with your brand color for highlights only
  // brand green = #9AD872
  const lime = "#9AD872";

  const { data: rawSessions, isLoading } = useQuery({
    queryKey: ["sessions", "all"],
    queryFn: () => SessionService.getAll(),
    select: (res: any) => (Array.isArray(res) ? res : res?.data || []),
    staleTime: 1000 * 60 * 5,
  });

  const filtered = useMemo(() => {
    if (!rawSessions) return [];
    let r = [...rawSessions];

    // Search Logic
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(s => 
        s.title.toLowerCase().includes(q) || 
        (typeof s.coach === 'string' ? s.coach.toLowerCase().includes(q) : s.coach?.name?.toLowerCase().includes(q))
      );
    }

    // Filter Logic
    if (sport !== "All") r = r.filter(s => s.category === sport || s.sport === sport);
    r = r.filter(s => s.price <= maxPrice);

    // Sort Logic
    if (sortBy === "price-asc") r.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") r.sort((a, b) => b.price - a.price);
    else if (sortBy === "rating") r.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    
    return r;
  }, [rawSessions, search, sport, maxPrice, sortBy]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleFilterChange = (action: () => void) => {
    action();
    setPage(1);
  };

  return (
    <div className="min-h-screen pt-20 pb-16 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border bg-card text-card-foreground shadow-sm">
            <span className="opacity-50">🔍</span>
            <input 
              value={search} 
              onChange={e => handleFilterChange(() => setSearch(e.target.value))}
              placeholder="Search sessions..." 
              className="bg-transparent outline-none w-full text-sm"
            />
          </div>
          <select 
            value={sortBy} 
            onChange={e => handleFilterChange(() => setSortBy(e.target.value))}
            className="px-4 py-3 rounded-xl border bg-card text-card-foreground text-sm cursor-pointer outline-none shadow-sm"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 space-y-6">
            <div className="rounded-xl p-6 border bg-card text-card-foreground shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-4 opacity-60">Sport</h3>
              <div className="flex flex-col gap-1">
                {SPORTS.map(s => (
                  <button 
                    key={s} 
                    onClick={() => handleFilterChange(() => setSport(s))}
                    className={`text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      sport === s ? 'font-bold' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ 
                      color: sport === s ? lime : 'inherit',
                      background: sport === s ? 'hsla(75,100%,55%,0.1)' : 'transparent'
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-border">
                <h3 className="text-xs font-bold uppercase tracking-widest mb-4 opacity-60">Max Price</h3>
                <input 
                  type="range" min="500" max="5000" step="100"
                  value={maxPrice}
                  onChange={e => handleFilterChange(() => setMaxPrice(Number(e.target.value)))}
                  className="w-full h-2 rounded-lg cursor-pointer accent-lime-500"
                />
                <div className="flex justify-between text-xs mt-3 opacity-70">
                  <span>৳500</span>
                  <span className="font-bold" style={{ color: lime }}>৳{maxPrice}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Grid Area */}
          <div className="flex-1">
            <div className="mb-6 flex justify-between items-center px-1">
               <p className="text-sm opacity-60">Showing {paginated.length} of {filtered.length} sessions</p>
            </div>

            {isLoading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(PER_PAGE)].map((_, i) => <SessionCardSkeleton key={i} />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-24 border-2 border-dashed rounded-3xl opacity-40">
                <p>No sessions found matching your filters.</p>
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
                  {paginated.map(s => <SessionCard key={s.id} session={s} />)}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-8 border-t border-border">
                    <button 
                      onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      disabled={page === 1}
                      className="px-4 py-2 rounded-xl border bg-card disabled:opacity-30 text-sm transition-hover hover:border-[#9AD872]/50"
                    >
                      Prev
                    </button>
                    
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <button
                          key={p}
                          onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className={`w-10 h-10 rounded-xl text-sm font-bold transition-all border ${
                            p === page ? 'bg-[#9AD872] text-black border-[#9AD872]' : 'bg-card opacity-70 hover:opacity-100'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>

                    <button 
                      onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      disabled={page === totalPages}
                      className="px-4 py-2 rounded-xl border bg-card disabled:opacity-30 text-sm transition-hover hover:border-[#9AD872]/50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}