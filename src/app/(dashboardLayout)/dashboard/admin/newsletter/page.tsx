"use client";
import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import NewsletterService from "@/services/newsletter.service";
import type { NewsletterSubscriber } from "@/types/newsletter";

const PAGE_LIMIT = 20;

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS = {
  ACTIVE: {
    label: "Active",
    classes: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  PENDING: {
    label: "Pending",
    classes: "bg-amber-100 text-amber-700 border-amber-200",
    dot: "bg-amber-400",
  },
  INACTIVE: {
    label: "Inactive",
    classes: "bg-slate-200 text-[#7a9c6e] border-slate-300",
    dot: "bg-slate-400",
  },
} as const;

type StatusKey = keyof typeof STATUS;
type FilterKey = "ALL" | StatusKey;

function getStatus(s: NewsletterSubscriber): StatusKey {
  if (!s.isActive) return "INACTIVE";
  if (!s.confirmedAt) return "PENDING";
  return "ACTIVE";
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function Avatar({ name, email }: { name?: string | null; email: string }) {
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : email[0].toUpperCase();
  const palettes = [
    "bg-lime-100 text-lime-700",
    "bg-sky-100 text-sky-700",
    "bg-violet-100 text-violet-700",
    "bg-rose-100 text-rose-700",
    "bg-amber-100 text-amber-700",
  ];
  const color = palettes[email.charCodeAt(0) % palettes.length];
  return (
    <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black flex-shrink-0", color)}>
      {initials}
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number | string; accent?: string }) {
  return (
    <div className="bg-[#162513] border border-slate-200/60 rounded-2xl p-5 space-y-1 shadow-sm">
      <p className="text-[10px] font-black text-[#7a9c6e] uppercase tracking-widest">{label}</p>
      <p className={cn("text-2xl font-black", accent ?? "text-slate-900")}>{value}</p>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-6 py-4 animate-pulse">
      <div className="w-10 h-10 rounded-2xl bg-slate-100 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-slate-100 rounded-full w-32" />
        <div className="h-2.5 bg-slate-100 rounded-full w-48" />
      </div>
      <div className="hidden md:block h-3 bg-slate-100 rounded-full w-24" />
      <div className="h-5 bg-slate-100 rounded-full w-16" />
      <div className="h-8 bg-slate-100 rounded-xl w-20" />
    </div>
  );
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
      <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-2xl">✉️</div>
      <p className="text-base font-black text-slate-700">
        {filtered ? "No subscribers match" : "No subscribers yet"}
      </p>
      <p className="text-xs text-[#7a9c6e] max-w-xs">
        {filtered
          ? "Try a different filter or search term."
          : "Subscribers will appear here once members sign up via the newsletter form."}
      </p>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function PageBtn({ p, current, onPage, disabled }: { p: number; current: number; onPage: (p: number) => void; disabled: boolean }) {
  return (
    <button
      onClick={() => onPage(p)}
      disabled={disabled}
      className={cn(
        "w-8 h-8 rounded-xl text-[10px] font-black transition-all",
        p === current
          ? "bg-[#162513] text-[#f0f7ec]"
          : "text-[#7a9c6e] hover:bg-slate-100 hover:text-slate-700"
      )}
    >
      {p}
    </button>
  );
}

function Pagination({ page, totalPages, onPage, isFetching }: { page: number; totalPages: number; onPage: (p: number) => void; isFetching: boolean }) {
  const pages = useMemo(() => {
    const range: number[] = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);
    for (let i = start; i <= end; i++) range.push(i);
    return range;
  }, [page, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-50">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1 || isFetching}
        className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 text-[#7a9c6e] hover:bg-slate-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
      >
        ← Prev
      </button>
      <div className="flex items-center gap-1">
        {pages[0] > 1 && (
          <>
            <PageBtn p={1} current={page} onPage={onPage} disabled={isFetching} />
            {pages[0] > 2 && <span className="text-xs text-slate-300 px-1">…</span>}
          </>
        )}
        {pages.map((p) => <PageBtn key={p} p={p} current={page} onPage={onPage} disabled={isFetching} />)}
        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && <span className="text-xs text-slate-300 px-1">…</span>}
            <PageBtn p={totalPages} current={page} onPage={onPage} disabled={isFetching} />
          </>
        )}
      </div>
      <button
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages || isFetching}
        className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 text-[#7a9c6e] hover:bg-slate-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
      >
        Next →
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function NewsletterSubscribersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("ALL");
  const [search, setSearch] = useState("");

  function handleFilter(f: FilterKey) { setActiveFilter(f); setPage(1); }
  function handleSearch(q: string) { setSearch(q); setPage(1); }

  // ── Query ──────────────────────────────────────────────────────────────────
  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ["newsletter", "subscribers", page],
    queryFn: () => NewsletterService.getSubscribers(page, PAGE_LIMIT),
    placeholderData: (prev) => prev, // keep previous page visible while loading next
  });

  const subscribers = data?.data ?? [];
  const meta = data?.meta;

  // ── Client-side filter/search on current page ──────────────────────────────
  const filtered = useMemo(() => {
    return subscribers.filter((s) => {
      const status = getStatus(s);
      const matchesFilter = activeFilter === "ALL" || status === activeFilter;
      const q = search.toLowerCase();
      const matchesSearch = !q || s.email.toLowerCase().includes(q) || (s.name?.toLowerCase().includes(q) ?? false);
      return matchesFilter && matchesSearch;
    });
  }, [subscribers, activeFilter, search]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: meta?.total ?? 0,
    active: subscribers.filter((s) => s.isActive && s.confirmedAt).length,
    pending: subscribers.filter((s) => s.isActive && !s.confirmedAt).length,
    inactive: subscribers.filter((s) => !s.isActive).length,
  }), [subscribers, meta]);

  // ── Unsubscribe mutation ───────────────────────────────────────────────────
  const unsubscribeMutation = useMutation({
    mutationFn: (email: string) => NewsletterService.unsubscribe({ email }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["newsletter", "subscribers"] }),
  });

  return (
    <div className="p-6 lg:p-10 space-y-8 bg-[#f8fafc] min-h-screen text-slate-900">

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            Newsletter <span className="text-lime-600">Subscribers</span>
          </h1>
          <p className="text-[#7a9c6e] text-sm mt-1 font-medium italic">
            Manage your mailing list and subscriber statuses.
          </p>
        </div>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ["newsletter", "subscribers"] })}
          disabled={isFetching}
          className="px-6 py-3 bg-[#162513] text-[#f0f7ec] hover:bg-[#0f1a0d] rounded-2xl text-sm font-bold transition-all shadow-lg  flex items-center gap-2 active:scale-95 disabled:opacity-60"
        >
          <span className={cn("text-base", isFetching && "animate-spin inline-block")}>↻</span>
          {isFetching ? "Loading..." : "Refresh"}
        </button>
      </header>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Subscribers" value={stats.total} />
        <StatCard label="Confirmed" value={stats.active} accent="text-emerald-600" />
        <StatCard label="Pending Confirmation" value={stats.pending} accent="text-amber-500" />
        <StatCard label="Inactive" value={stats.inactive} accent="text-[#7a9c6e]" />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#162513] p-3 rounded-[1.5rem] border border-slate-200/60 shadow-sm">
        <div className="flex gap-1 bg-slate-100/50 p-1 rounded-xl">
          {(["ALL", "ACTIVE", "PENDING", "INACTIVE"] as FilterKey[]).map((f) => (
            <button
              key={f}
              onClick={() => handleFilter(f)}
              className={cn(
                "px-5 py-2 rounded-lg text-[10px] font-black transition-all tracking-widest uppercase",
                activeFilter === f
                  ? "bg-[#162513] text-[#0f1a0d] shadow-sm ring-1 ring-slate-200"
                  : "text-[#7a9c6e] hover:text-[#7a9c6e]"
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="pl-4 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-lime-500/20 focus:border-[#9AD872] w-full md:w-72 transition-all"
        />
      </div>

      {/* Table */}
      <div className={cn(
        "bg-[#162513] border border-slate-200/60 rounded-[2rem] overflow-hidden shadow-sm transition-opacity duration-200",
        isFetching && !isLoading && "opacity-70"
      )}>
        {/* Column Headers */}
        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_auto] gap-4 px-6 py-3 border-b border-slate-50 bg-slate-50/50">
          {["Subscriber", "Joined", "Status", "Action"].map((h) => (
            <p key={h} className="text-[10px] font-black text-[#7a9c6e] uppercase tracking-widest">{h}</p>
          ))}
        </div>

        {isError && (
          <div className="flex items-center justify-center py-12">
            <div className="bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl px-6 py-4 text-sm font-medium">
              ✕ Failed to load subscribers. Please refresh.
            </div>
          </div>
        )}

        {isLoading && (
          <div className="divide-y divide-slate-50">
            {[...Array(8)].map((_, i) => <SkeletonRow key={i} />)}
          </div>
        )}

        {!isLoading && !isError && (
          <>
            {filtered.length === 0 ? (
              <EmptyState filtered={activeFilter !== "ALL" || search !== ""} />
            ) : (
              <div className="divide-y divide-slate-50">
                {filtered.map((subscriber) => {
                  const status = getStatus(subscriber);
                  const cfg = STATUS[status];
                  const isPending =
                    unsubscribeMutation.isPending &&
                    unsubscribeMutation.variables === subscriber.email;

                  return (
                    <div
                      key={subscriber.id}
                      className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_auto] gap-4 items-center px-6 py-4 hover:bg-slate-50/60 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar name={subscriber.name} email={subscriber.email} />
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-900 truncate group-hover:text-lime-600 transition-colors">
                            {subscriber.name ?? "—"}
                          </p>
                          <p className="text-xs text-[#7a9c6e] font-medium truncate">{subscriber.email}</p>
                        </div>
                      </div>

                      <p className="hidden md:block text-xs text-[#7a9c6e] font-medium">
                        {new Date(subscriber.createdAt).toLocaleDateString("en-US", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </p>

                      <div>
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest",
                          cfg.classes
                        )}>
                          <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", cfg.dot)} />
                          {cfg.label}
                        </span>
                      </div>

                      <div>
                        {subscriber.isActive ? (
                          <button
                            disabled={isPending}
                            onClick={() => unsubscribeMutation.mutate(subscriber.email)}
                            className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-100 text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-all disabled:opacity-50 active:scale-95 whitespace-nowrap"
                          >
                            {isPending ? "Removing…" : "Unsubscribe"}
                          </button>
                        ) : (
                          <span className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-300">
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination + Footer */}
            <div className="border-t border-slate-50">
              {meta && (
                <Pagination
                  page={page}
                  totalPages={meta.totalPages}
                  onPage={setPage}
                  isFetching={isFetching}
                />
              )}
              <div className="px-6 py-3 bg-slate-50/30">
                <p className="text-[10px] font-black text-[#7a9c6e] uppercase tracking-widest">
                  {search || activeFilter !== "ALL"
                    ? `${filtered.length} match${filtered.length !== 1 ? "es" : ""} on this page`
                    : `Page ${page} of ${meta?.totalPages ?? 1} · ${meta?.total ?? 0} total subscribers`}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}