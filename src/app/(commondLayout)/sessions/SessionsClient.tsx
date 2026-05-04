"use client";
import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { SessionCard, SessionCardSkeleton } from "@/components/sessions/SessionCard";
import SessionService from "@/services/session.service";
import { useQuery } from "@tanstack/react-query";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SessionMeta {
  page:       number;
  limit:      number;
  total:      number;
  totalPages: number;
  hasNext:    boolean;
  hasPrev:    boolean;
}

interface SessionsResponse {
  sessions: any[];
  meta:     SessionMeta;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SPORTS = ["All", "HIIT", "Boxing", "MMA", "Yoga", "Gymnastics"];

const SORT_OPTIONS = [
  { value: "popular",    label: "Most Popular"      },
  { value: "price-asc",  label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "rating",     label: "Highest Rated"     },
];

const BRAND    = "#9AD872";
const PER_PAGE = 9;

// ─── Component ────────────────────────────────────────────────────────────────

export default function SessionsClient() {
  const searchParams = useSearchParams();
  const defaultSport = searchParams.get("sport") || "All";
  const capSport =
    defaultSport.charAt(0).toUpperCase() + defaultSport.slice(1);

  // ── Filter state ───────────────────────────────────────────────────────────
  const [search,   setSearch]   = useState("");
  const [sport,    setSport]    = useState(capSport === "All" ? "All" : capSport);
  const [maxPrice, setMaxPrice] = useState<number | null>(null); // null = no cap
  const [sortBy,   setSortBy]   = useState("popular");
  const [page,     setPage]     = useState(1);

  // ── Data fetching (server-side pagination) ────────────────────────────────
  //
  // ROOT CAUSE FIX: the API returns { data: [...], meta: { total: 37, totalPages: 4 } }
  // which means only 10 records per call. We must send `page` as a query param
  // so TanStack Query re-fetches as the user navigates pages.
  //
  // Update SessionService.getAll() to accept params and forward them:
  //   getAll(params?) => axios.get('/sessions', { params })
  //
  const { data, isLoading, isError, isFetching } = useQuery<SessionsResponse>({
  queryKey: ["sessions", page, search, sport, sortBy],
  queryFn: () =>
    SessionService.getAll({
      page,
      limit:    PER_PAGE,
      search:   search || undefined,
      category: sport !== "All" ? sport : undefined,
      sortBy:   sortBy || undefined,
    }),
  placeholderData: (prev) => prev,
  staleTime: 1000 * 60 * 2,
});

  const sessions: any[]       = data?.sessions ?? [];
  const meta:     SessionMeta = data?.meta ?? {
    page: 1, limit: PER_PAGE, total: 0,
    totalPages: 1, hasNext: false, hasPrev: false,
  };

  // ── Client-side price filter ───────────────────────────────────────────────
  // Price filtering stays client-side. If your API supports ?maxPrice=, move
  // it into the queryFn above as another param.
  const filteredSessions = useMemo(() => {
    if (maxPrice === null) return sessions;
    return sessions.filter((s: any) => Number(s.price) <= maxPrice);
  }, [sessions, maxPrice]);

  // ── Dynamic slider max from current page data ──────────────────────────────
  const pageMaxPrice = useMemo(() => {
    if (!sessions.length) return 500;
    return (
      Math.ceil(
        Math.max(...sessions.map((s: any) => Number(s.price) || 0)) / 100,
      ) * 100 || 500
    );
  }, [sessions]);

  const sliderValue = maxPrice ?? pageMaxPrice;

  // ── Helpers ────────────────────────────────────────────────────────────────
  const applyFilter = (action: () => void) => {
    action();
    setPage(1);
  };

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const hasActiveFilters = sport !== "All" || maxPrice !== null || !!search;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pt-20 pb-16 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Search + Sort Bar ── */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border bg-card text-card-foreground shadow-sm">
            <span className="opacity-50">🔍</span>
            <input
              value={search}
              onChange={(e) => applyFilter(() => setSearch(e.target.value))}
              placeholder="Search by title or coach…"
              className="bg-transparent outline-none w-full text-sm"
            />
            {search && (
              <button
                onClick={() => applyFilter(() => setSearch(""))}
                className="text-xs opacity-40 hover:opacity-80 transition-opacity"
              >
                ✕
              </button>
            )}
          </div>

          <select
            value={sortBy}
            onChange={(e) => applyFilter(() => setSortBy(e.target.value))}
            className="px-4 py-3 rounded-xl border bg-card text-card-foreground text-sm cursor-pointer outline-none shadow-sm"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Sidebar ── */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="rounded-xl p-6 border bg-card text-card-foreground shadow-sm">

              {/* Sport filter */}
              <h3 className="text-xs font-bold uppercase tracking-widest mb-4 opacity-60">
                Sport / Category
              </h3>
              <div className="flex flex-col gap-1">
                {SPORTS.map((s) => (
                  <button
                    key={s}
                    onClick={() => applyFilter(() => setSport(s))}
                    className="text-left px-3 py-2 rounded-lg text-sm transition-all"
                    style={{
                      color:      sport === s ? BRAND : "inherit",
                      background: sport === s ? "hsla(90,60%,65%,0.12)" : "transparent",
                      fontWeight: sport === s ? 700 : 400,
                      opacity:    sport === s ? 1 : 0.7,
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Price range slider */}
              <div className="mt-8 pt-6 border-t border-border">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xs font-bold uppercase tracking-widest opacity-60">
                    Max Price
                  </h3>
                  {maxPrice !== null && (
                    <button
                      onClick={() => applyFilter(() => setMaxPrice(null))}
                      className="text-[10px] opacity-40 hover:opacity-80 transition-opacity"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {isLoading ? (
                  <div className="h-8 rounded bg-muted animate-pulse mt-4" />
                ) : (
                  <>
                    <input
                      type="range"
                      min={0}
                      max={pageMaxPrice}
                      step={10}
                      value={sliderValue}
                      onChange={(e) =>
                        applyFilter(() => setMaxPrice(Number(e.target.value)))
                      }
                      className="w-full h-2 rounded-lg cursor-pointer accent-lime-500 mt-4"
                    />
                    <div className="flex justify-between text-xs mt-3 opacity-70">
                      <span>৳0</span>
                      <span className="font-bold" style={{ color: BRAND }}>
                        {maxPrice === null
                          ? `৳${pageMaxPrice} (all)`
                          : `৳${maxPrice}`}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Clear all filters */}
              {hasActiveFilters && (
                <div className="mt-6 pt-4 border-t border-border">
                  <button
                    onClick={() => {
                      setSport("All");
                      setMaxPrice(null);
                      setSearch("");
                      setPage(1);
                    }}
                    className="w-full text-xs py-2 rounded-lg border border-dashed opacity-60 hover:opacity-100 transition-opacity"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </aside>

          {/* ── Main Grid ── */}
          <div className="flex-1 min-w-0">

            {/* Result count */}
            <div className="mb-6 flex justify-between items-center px-1">
              <p className="text-sm opacity-60 flex items-center gap-2">
                {isLoading
                  ? "Loading sessions…"
                  : `Showing ${filteredSessions.length} of ${meta.total} sessions`}
                {/* Subtle spinner when paginating (not initial load) */}
                {isFetching && !isLoading && (
                  <span className="inline-block w-3 h-3 rounded-full border-2 border-[#9AD872] border-t-transparent animate-spin" />
                )}
              </p>
            </div>

            {/* Grid states */}
            {isLoading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(PER_PAGE)].map((_, i) => (
                  <SessionCardSkeleton key={i} />
                ))}
              </div>
            ) : isError ? (
              <div className="text-center py-24 border-2 border-dashed rounded-3xl opacity-50">
                <p className="text-lg mb-1">⚠️ Failed to load sessions</p>
                <p className="text-sm opacity-60">Please try refreshing the page.</p>
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="text-center py-24 border-2 border-dashed rounded-3xl opacity-40">
                <p className="text-lg mb-1">No sessions found</p>
                <p className="text-sm">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
                  {filteredSessions.map((s: any) => (
                    <SessionCard key={s.id} session={s} />
                  ))}
                </div>

                {/* ── Pagination ── */}
                {meta.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-8 border-t border-border flex-wrap">
                    <button
                      onClick={() => { setPage((p) => Math.max(1, p - 1)); scrollTop(); }}
                      disabled={!meta.hasPrev}
                      className="px-4 py-2 rounded-xl border bg-card disabled:opacity-30 text-sm transition-all hover:border-[#9AD872]/50"
                    >
                      ← Prev
                    </button>

                    <div className="flex gap-1 flex-wrap justify-center">
                      {buildPageRange(meta.page, meta.totalPages).map((p, i) =>
                        p === "…" ? (
                          <span
                            key={`ellipsis-${i}`}
                            className="w-10 h-10 flex items-center justify-center text-sm opacity-40"
                          >
                            …
                          </span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => { setPage(p as number); scrollTop(); }}
                            className="w-10 h-10 rounded-xl text-sm font-bold transition-all border"
                            style={{
                              background:  p === meta.page ? BRAND : undefined,
                              color:       p === meta.page ? "#0f1a0d" : undefined,
                              borderColor: p === meta.page ? BRAND : undefined,
                              opacity:     p === meta.page ? 1 : 0.7,
                            }}
                          >
                            {p}
                          </button>
                        ),
                      )}
                    </div>

                    <button
                      onClick={() => { setPage((p) => Math.min(meta.totalPages, p + 1)); scrollTop(); }}
                      disabled={!meta.hasNext}
                      className="px-4 py-2 rounded-xl border bg-card disabled:opacity-30 text-sm transition-all hover:border-[#9AD872]/50"
                    >
                      Next →
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

// ─── Utility: smart page numbers with ellipsis ───────────────────────────────
function buildPageRange(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "…")[] = [1];

  if (current > 3) pages.push("…");

  for (
    let i = Math.max(2, current - 1);
    i <= Math.min(total - 1, current + 1);
    i++
  ) {
    pages.push(i);
  }

  if (current < total - 2) pages.push("…");
  pages.push(total);

  return pages;
}