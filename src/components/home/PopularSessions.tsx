"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { SessionCard, SessionCardSkeleton } from "@/components/sessions/SessionCard";
import SessionService from "@/services/session.service";
import { Session } from "@/types/gym";

export function PopularSessions() {
  const { data: sessions = [], isLoading, isError } = useQuery({
    queryKey: ["sessions", "popular-home"],
    queryFn:  () => SessionService.getAll({ page: 1, limit: 100 }),
    // getAll() returns { sessions: Session[], meta: {} }
    select: (res: any): Session[] => {
      const arr: Session[] =
        Array.isArray(res)            ? res           // plain array (old service)
        : Array.isArray(res?.sessions) ? res.sessions  // { sessions: [...] } ✅ new service
        : Array.isArray(res?.data)     ? res.data      // { data: [...] } fallback
        : [];
      return [...arr].sort(() => 0.5 - Math.random()).slice(0, 4);
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <span className="inline-block bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-3">
              Discover
            </span>
            <h2 className="font-black text-[clamp(36px,5vw,56px)] leading-tight uppercase text-foreground">
              Featured<br />
              <span className="text-primary">Sessions</span>
            </h2>
          </div>
          <Link
            href="/sessions"
            className="border border-border text-muted-foreground font-bold text-sm px-5 py-2.5 rounded-xl hover:border-primary/50 hover:text-primary transition-all tracking-wide"
          >
            VIEW ALL →
          </Link>
        </div>

        {/* ── Grid ── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <SessionCardSkeleton key={i} />)
          ) : isError ? (
            <div className="col-span-full text-center py-10 text-destructive text-sm">
              Failed to load sessions. Please try again.
            </div>
          ) : sessions.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-card rounded-2xl border border-dashed border-border">
              <p className="text-muted-foreground">No active sessions found.</p>
            </div>
          ) : (
            sessions.map((s: Session) => <SessionCard key={s.id} session={s} />)
          )}
        </div>
      </div>
    </section>
  );
}