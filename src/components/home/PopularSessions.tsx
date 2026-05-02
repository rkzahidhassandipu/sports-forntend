"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { SessionCard, SessionCardSkeleton } from "@/components/sessions/SessionCard";
import SessionService from "@/services/session.service";
import { Session } from "@/types/gym";

/* ─── Shared UI Component ─── */
function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block bg-[#9AD872]/10 text-[#9AD872] border border-[#9AD872]/30 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-3">
      {children}
    </span>
  );
}

export function PopularSessions() {
  const { data: sessions, isLoading, isError } = useQuery({
    queryKey: ["sessions", "popular"],
    queryFn: () => SessionService.getAll(),
    // We transform the paginated response into our random 4 items here
    select: (response: any) => {
      const rawData = Array.isArray(response) ? response : response?.data || [];
      return [...rawData]
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);
    },
    // Keep data fresh for 5 minutes, but don't refetch on every window focus
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  return (
    <section className="py-20 bg-brand-mid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <SectionTag>Discover</SectionTag>
            <h2 className="font-display font-black text-[clamp(36px,5vw,56px)] leading-tight uppercase">
              Featured<br /><span className="text-[#9AD872]">Sessions</span>
            </h2>
          </div>
          <Link 
            href="/sessions" 
            className="border border-brand-border text-muted-foreground font-display font-bold text-sm px-5 py-2.5 rounded-xl hover:border-[#9AD872] hover:text-[#9AD872] transition-all tracking-wide"
          >
            VIEW ALL →
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => <SessionCardSkeleton key={i} />)
          ) : isError ? (
            <div className="col-span-full text-center py-10 text-red-400">
              Failed to load sessions. Please try again.
            </div>
          ) : (
            sessions?.map((s: Session) => <SessionCard key={s.id} session={s} />)
          )}
        </div>

        {!isLoading && !isError && sessions?.length === 0 && (
          <div className="text-center py-20 bg-brand-card rounded-2xl border border-dashed border-brand-border">
            <p className="text-muted-foreground">No active sessions found.</p>
          </div>
        )}
      </div>
    </section>
  );
}