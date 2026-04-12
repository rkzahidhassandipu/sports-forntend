import type { MockSession } from "@/lib/data";
"use client";
import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { SESSIONS } from "@/lib/data";
import { SessionCard, SessionCardSkeleton } from "@/components/sessions/SessionCard";
import { cn } from "@/lib/utils";


const SPORTS = ["All","Football","Swimming","Fitness","Boxing","Basketball","Tennis","Badminton","Gymnastics"];
const LEVELS = ["All Levels","Beginner","Intermediate","Advanced"];
const SORT_OPTIONS = [
  { value:"popular", label:"Most Popular" },
  { value:"price-asc", label:"Price: Low to High" },
  { value:"price-desc", label:"Price: High to Low" },
  { value:"rating", label:"Highest Rated" },
  { value:"newest", label:"Newest" },
];

export default function SessionsClient() {
  const searchParams = useSearchParams();
  const defaultSport = searchParams.get("sport") || "All";
  const cap = defaultSport.charAt(0).toUpperCase() + defaultSport.slice(1);

  const [search, setSearch] = useState("");
  const [sport, setSport] = useState(cap === "All" ? "All" : cap);
  const [level, setLevel] = useState("All Levels");
  const [maxPrice, setMaxPrice] = useState(5000);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("popular");
  const [page, setPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const PER_PAGE = 8;

  const filtered = useMemo(() => {
    let r: MockSession[] = [...SESSIONS];
    if (search) r = r.filter(s => s.title.toLowerCase().includes(search.toLowerCase()) || s.coach.toLowerCase().includes(search.toLowerCase()) || s.sport.toLowerCase().includes(search.toLowerCase()));
    if (sport !== "All") r = r.filter(s => s.sport === sport);
    if (level !== "All Levels") r = r.filter(s => s.level === level || s.level === "All Levels");
    r = r.filter(s => s.price <= maxPrice && s.rating >= minRating);
    switch(sortBy) {
      case "price-asc": r.sort((a,b) => a.price - b.price); break;
      case "price-desc": r.sort((a,b) => b.price - a.price); break;
      case "rating": r.sort((a,b) => b.rating - a.rating); break;
      default: r.sort((a,b) => b.reviewCount - a.reviewCount);
    }
    return r;
  }, [search, sport, level, maxPrice, minRating, sortBy]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);

  function reset() { setSport("All"); setLevel("All Levels"); setMaxPrice(5000); setMinRating(0); setSearch(""); setPage(1); }

  const brd = "hsl(220 18% 18%)";
  const bg2 = "hsl(220 22% 10%)";
  const bgc = "hsl(220 20% 13%)";
  const mut = "hsl(220 12% 60%)";
  const lime = "hsl(75 100% 55%)";
  const fg = "hsl(210 20% 95%)";

  const FilterPanel = () => (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <div className="rounded-xl p-5 sticky top-24" style={{ background: bg2, border: `1px solid ${brd}` }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-sm tracking-wider uppercase">Filters</h3>
          <button onClick={reset} className="text-xs transition-colors" style={{ color: lime }}>Reset all</button>
        </div>
        <div className="mb-5">
          <label className="block text-xs font-bold tracking-wider uppercase mb-3" style={{ color: mut }}>Sport</label>
          <div className="flex flex-col gap-1">
            {SPORTS.map(s => (
              <button key={s} onClick={() => { setSport(s); setPage(1); }} className="text-left px-3 py-2 rounded-lg text-sm transition-all duration-200" style={{ background: sport===s ? `hsla(75,100%,55%,0.12)` : "transparent", border: sport===s ? `1px solid hsla(75,100%,55%,0.25)` : "1px solid transparent", color: sport===s ? lime : mut }}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-5 pt-5" style={{ borderTop: `1px solid ${brd}` }}>
          <label className="block text-xs font-bold tracking-wider uppercase mb-3" style={{ color: mut }}>Level</label>
          <div className="flex flex-col gap-1">
            {LEVELS.map(l => (
              <button key={l} onClick={() => { setLevel(l); setPage(1); }} className="text-left px-3 py-2 rounded-lg text-sm transition-all duration-200" style={{ background: level===l ? `hsla(75,100%,55%,0.12)` : "transparent", border: level===l ? `1px solid hsla(75,100%,55%,0.25)` : "1px solid transparent", color: level===l ? lime : mut }}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-5 pt-5" style={{ borderTop: `1px solid ${brd}` }}>
          <label className="block text-xs font-bold tracking-wider uppercase mb-3" style={{ color: mut }}>
            Max Price: <span style={{ color: lime }}>৳{maxPrice.toLocaleString()}</span>
          </label>
          <input type="range" min={500} max={5000} step={100} value={maxPrice} onChange={e => { setMaxPrice(Number(e.target.value)); setPage(1); }} className="w-full" style={{ accentColor: lime }} />
          <div className="flex justify-between text-xs mt-1" style={{ color: mut }}><span>৳500</span><span>৳5,000</span></div>
        </div>
        <div className="pt-5" style={{ borderTop: `1px solid ${brd}` }}>
          <label className="block text-xs font-bold tracking-wider uppercase mb-3" style={{ color: mut }}>Min Rating</label>
          <div className="flex flex-col gap-1">
            {[0,4,4.5,5].map(r => (
              <button key={r} onClick={() => { setMinRating(r); setPage(1); }} className="text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2" style={{ background: minRating===r ? `hsla(75,100%,55%,0.12)` : "transparent", border: minRating===r ? `1px solid hsla(75,100%,55%,0.25)` : "1px solid transparent", color: minRating===r ? lime : mut }}>
                {r===0 ? "All Ratings" : <><span style={{ color:"#f59e0b" }}>{"★".repeat(Math.floor(r))}</span><span>{r}+</span></>}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => {}} className="mt-5 w-full font-display font-bold py-3 rounded-xl text-sm tracking-wide transition-all" style={{ background: lime, color: "hsl(220 25% 6%)" }}>
          APPLY FILTERS
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="py-10 border-b" style={{ background: bg2, borderColor: brd }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-3" style={{ background: "hsla(75,100%,55%,0.1)", border: "1px solid hsla(75,100%,55%,0.3)", color: lime }}>Explore</span>
          <h1 className="font-display font-black text-5xl leading-tight mb-2">FIND YOUR <span style={{ color: lime }}>SESSION</span></h1>
          <p className="text-sm" style={{ color: mut }}>{filtered.length} sessions · {SPORTS.length-1} sports</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="flex-1 min-w-[200px] flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: bg2, border: `1px solid ${brd}` }}>
            <span style={{ color: mut }} className="text-sm">🔍</span>
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search sessions, coaches, sports..." className="flex-1 bg-transparent outline-none text-sm" style={{ color: fg }} />
            {search && <button onClick={() => setSearch("")} className="text-xs transition-colors" style={{ color: mut }}>✕</button>}
          </div>
          <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }} className="rounded-xl px-4 py-3 text-sm outline-none cursor-pointer" style={{ background: bg2, border: `1px solid ${brd}`, color: fg }}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden rounded-xl px-4 py-3 text-sm transition-colors" style={{ border: `1px solid ${brd}`, color: mut }}>⚙ Filters</button>
        </div>
        {sidebarOpen && <div className="lg:hidden mb-6"><FilterPanel /></div>}
        <div className="flex gap-6">
          <div className="hidden lg:block"><FilterPanel /></div>
          <div className="flex-1">
            {paginated.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="font-display font-bold text-2xl mb-2">No Sessions Found</h3>
                <p className="text-sm mb-6" style={{ color: mut }}>Try adjusting your filters or search term.</p>
                <button onClick={reset} className="font-display font-bold px-6 py-3 rounded-xl text-sm tracking-wide" style={{ background: lime, color: "hsl(220 25% 6%)" }}>CLEAR FILTERS</button>
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
                  {paginated.map(s => <SessionCard key={s.id} session={s} />)}
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => setPage(Math.max(1,page-1))} disabled={page===1} className="w-9 h-9 rounded-lg flex items-center justify-center text-sm transition-colors disabled:opacity-30" style={{ border: `1px solid ${brd}`, color: mut }}>‹</button>
                    {Array.from({length:totalPages},(_,i)=>i+1).map(p => (
                      <button key={p} onClick={() => setPage(p)} className="w-9 h-9 rounded-lg text-sm font-bold transition-all" style={p===page ? { background: lime, color: "hsl(220 25% 6%)" } : { border: `1px solid ${brd}`, color: mut }}>
                        {p}
                      </button>
                    ))}
                    <button onClick={() => setPage(Math.min(totalPages,page+1))} disabled={page===totalPages} className="w-9 h-9 rounded-lg flex items-center justify-center text-sm transition-colors disabled:opacity-30" style={{ border: `1px solid ${brd}`, color: mut }}>›</button>
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
