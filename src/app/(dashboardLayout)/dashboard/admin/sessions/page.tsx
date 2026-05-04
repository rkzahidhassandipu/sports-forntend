"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import CreateSessionModal from "@/components/dashboard/admin/Sessio/CreateSessionModal";
import { Button } from "@/components/ui/button";
import SessionService from "@/services/session.service";
import { Session } from "@/types/gym";
import { toast } from "sonner";
import { SessionStatus } from "@/types/enums";
import UpdateSessionModal from "@/components/dashboard/admin/Sessio/UpdateSessionModal";
import { Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<SessionStatus, string> = {
  SCHEDULED: "bg-blue-100 text-blue-700 border-blue-200",
  ACTIVE:    "bg-emerald-100 text-emerald-700 border-emerald-200",
  COMPLETED: "bg-slate-100 text-slate-700 border-slate-200",
  CANCELLED: "bg-rose-100 text-rose-700 border-rose-200",
};

const PER_PAGE = 9;

// ─── Page range helper ────────────────────────────────────────────────────────

function buildPageRange(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  if (current > 3) pages.push("…");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
  if (current < total - 2) pages.push("…");
  pages.push(total);
  return pages;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ManageSessionsPage() {
  const queryClient = useQueryClient();

  const [activeFilter,      setActiveFilter]      = useState<SessionStatus | "ALL">("ALL");
  const [searchQuery,       setSearchQuery]       = useState("");
  const [page,              setPage]              = useState(1);
  const [isModalOpen,       setIsModalOpen]       = useState(false);
  const [selectedSession,   setSelectedSession]   = useState<Session | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const isAdmin = true;

  // ── Fetch with server-side pagination ─────────────────────────────────────
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["sessions", "admin", page, activeFilter, searchQuery],
    queryFn: () =>
      SessionService.getAll({
        page,
        limit:  PER_PAGE,
        status: activeFilter !== "ALL" ? activeFilter : undefined,
        search: searchQuery || undefined,
      }),
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 2,
  });

  const sessions: Session[] = data?.sessions ?? [];
  const totalPages          = data?.meta?.totalPages ?? 1;
  const totalCount          = data?.meta?.total ?? 0;

  // ── Helpers ────────────────────────────────────────────────────────────────
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["sessions", "admin"] });

  const applyFilter = (action: () => void) => {
    action();
    setPage(1);
  };

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const handleUpdateClick = (session: Session) => {
    setSelectedSession(session);
    setIsUpdateModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this session? This action cannot be undone.")) return;
    try {
      await SessionService.delete(id);
      toast.success("Session deleted successfully");
      if (sessions.length === 1 && page > 1) setPage((p) => p - 1);
      else refresh();
    } catch {
      toast.error("Failed to delete session");
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 lg:p-10 space-y-8 bg-background min-h-screen text-foreground">

      {/* ── Header ── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            Session <span className="text-primary">Inventory</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1 font-medium italic">
            Create and oversee training schedules for members.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 rounded-2xl text-sm font-bold shadow-lg flex items-center gap-2 active:scale-95"
        >
          <span className="text-lg">+</span> Create New Session
        </Button>
      </header>

      {/* ── Filter bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-primary p-3 rounded-[1.5rem] shadow-sm">
        <div className="flex flex-wrap gap-1 bg-white/10 p-1 rounded-xl">
          {["ALL", ...Object.values(SessionStatus)].map((status) => (
            <button
              key={status}
              onClick={() => applyFilter(() => setActiveFilter(status as SessionStatus | "ALL"))}
              className={cn(
                "px-4 py-2 rounded-lg text-[10px] font-black transition-all tracking-widest uppercase",
                activeFilter === status
                  ? "bg-background text-primary shadow-sm"
                  : "text-primary-foreground/70 hover:text-primary-foreground",
              )}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {!isLoading && (
            <span className="text-[10px] font-bold text-primary-foreground/60 uppercase tracking-widest hidden md:block">
              {totalCount} sessions
            </span>
          )}
          {isFetching && !isLoading && (
            <span className="w-3 h-3 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
          )}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => applyFilter(() => setSearchQuery(e.target.value))}
            placeholder="Search by title..."
            className="pl-4 pr-4 py-2 bg-background border border-border rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/30 w-full md:w-56 transition-all"
          />
        </div>
      </div>

      {/* ── Grid ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(PER_PAGE)].map((_, i) => (
            <div key={i} className="rounded-[2.5rem] bg-muted animate-pulse h-80" />
          ))}
        </div>
      ) : sessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="group bg-card border border-border rounded-[2.5rem] overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              {/* Cover */}
              <div className="relative h-44 bg-muted">
                {session.coverImage ? (
                  <img
                    src={session.coverImage}
                    alt={session.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                    No Cover Image
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest shadow-sm",
                      STATUS_COLORS[session.status as SessionStatus],
                    )}
                  >
                    {session.status}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-card-foreground leading-tight group-hover:text-primary transition-colors truncate">
                    {session.title}
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium">
                    {session.category || "General"} • {session.level || "All Levels"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-border">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      Attendance
                    </p>
                    <p className="text-sm font-bold text-card-foreground">
                      {session._count?.bookings || 0} / {session.capacity}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      Price
                    </p>
                    <p className="text-sm font-black text-card-foreground">
                      ${session.price}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-[10px]">
                      👤
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase truncate max-w-[80px]">
                      {session.coach?.name || "Assigning..."}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(session.id)}
                        className="p-2.5 rounded-xl border border-destructive/20 text-destructive hover:bg-destructive/10 transition-all"
                        title="Delete Session"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                    <button
                      onClick={() => handleUpdateClick(session)}
                      className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all"
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-[2.5rem]">
          <p className="text-muted-foreground font-medium">
            No sessions found matching your criteria.
          </p>
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6 border-t border-border flex-wrap">
          <button
            onClick={() => { setPage((p) => Math.max(1, p - 1)); scrollTop(); }}
            disabled={page === 1}
            className="flex items-center gap-1 px-4 py-2 rounded-xl border bg-card text-card-foreground disabled:opacity-30 text-sm transition-all hover:border-primary/50 hover:text-primary"
          >
            <ChevronLeft size={16} /> Prev
          </button>

          <div className="flex gap-1 flex-wrap justify-center">
            {buildPageRange(page, totalPages).map((p, i) =>
              p === "…" ? (
                <span
                  key={`e-${i}`}
                  className="w-10 h-10 flex items-center justify-center text-sm opacity-40"
                >
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => { setPage(p as number); scrollTop(); }}
                  className={cn(
                    "w-10 h-10 rounded-xl text-sm font-bold transition-all border",
                    p === page
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-card-foreground border-border opacity-70 hover:opacity-100 hover:border-primary/50",
                  )}
                >
                  {p}
                </button>
              ),
            )}
          </div>

          <button
            onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); scrollTop(); }}
            disabled={page === totalPages}
            className="flex items-center gap-1 px-4 py-2 rounded-xl border bg-card text-card-foreground disabled:opacity-30 text-sm transition-all hover:border-primary/50 hover:text-primary"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ── Modals ── */}
      <CreateSessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => { setIsModalOpen(false); refresh(); }}
      />

      <UpdateSessionModal
        session={selectedSession}
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedSession(null);
          refresh();
        }}
      />
    </div>
  );
}