import Link from "next/link";
import { cn, formatCurrency } from "@/lib/utils";
import type { MockSession as Session } from "@/lib/data";

function StatusBadge({ status }: { status: Session["status"] }) {
  return (
    <span className={cn(
      "text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase",
      status === "Available" && "bg-teal-500/15 text-teal-500 border border-teal-500/20",
      status === "Filling Fast" && "bg-lime-500/15 text-lime-500 border border-lime-500/20",
      status === "Full" && "bg-red-500/15 text-red-400 border border-red-500/20"
    )}>
      {status}
    </span>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-amber-400 text-xs tracking-tighter">
      {"★".repeat(Math.floor(rating))}{"☆".repeat(5 - Math.floor(rating))}
    </span>
  );
}

interface SessionCardProps {
  session: Session;
  className?: string;
}

export function SessionCard({ session, className }: SessionCardProps) {
  return (
    <div className={cn(
      "flex flex-col bg-brand-mid border border-brand-border rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-lime-500/30 hover:shadow-xl hover:shadow-lime-500/5 h-full",
      className
    )}>
      {/* Image area */}
      <div className="relative h-40 bg-gradient-to-br from-brand-card to-brand-mid flex items-center justify-center flex-shrink-0">
        <span className="text-5xl select-none">{session.icon}</span>
        <div className="absolute top-2.5 right-2.5">
          <StatusBadge status={session.status} />
        </div>
        <div className="absolute top-2.5 left-2.5">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-dark/80 text-muted-foreground border border-brand-border backdrop-blur-sm tracking-wider uppercase">
            {session.sport}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          <span className="text-[10px] font-semibold text-muted-foreground bg-brand-card border border-brand-border px-2 py-0.5 rounded-md uppercase tracking-wider">
            {session.level}
          </span>
          <span className="text-[10px] font-semibold text-muted-foreground bg-brand-card border border-brand-border px-2 py-0.5 rounded-md uppercase tracking-wider">
            {session.duration}
          </span>
        </div>

        <h3 className="font-display font-bold text-lg leading-tight mb-1.5 text-foreground">
          {session.title}
        </h3>

        <p className="text-xs text-muted-foreground leading-relaxed flex-1 mb-3 line-clamp-2">
          {session.description}
        </p>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
          <span>👤</span>
          <span>{session.coach}</span>
          <span className="mx-1 text-brand-border">·</span>
          <span>📍</span>
          <span className="truncate">{session.location}</span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className="font-display font-black text-xl text-lime-500">
            {formatCurrency(session.price)}
          </span>
          <div className="flex items-center gap-1">
            <Stars rating={session.rating} />
            <span className="text-xs text-muted-foreground">{session.rating} ({session.reviewCount})</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/sessions/${session.id}`}
            className="flex-1 bg-lime-500 text-brand-dark font-display font-bold text-xs py-2.5 rounded-lg text-center hover:bg-lime-400 transition-all duration-200 active:scale-95 tracking-wide"
          >
            BOOK NOW
          </Link>
          <button className="w-10 h-9 flex items-center justify-center rounded-lg border border-brand-border text-muted-foreground hover:text-red-400 hover:border-red-400/50 transition-all duration-200 text-sm">
            ♥
          </button>
        </div>
      </div>
    </div>
  );
}

export function SessionCardSkeleton() {
  return (
    <div className="flex flex-col bg-brand-mid border border-brand-border rounded-xl overflow-hidden h-[380px]">
      <div className="h-40 skeleton-shimmer flex-shrink-0" />
      <div className="flex-1 p-4 flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="h-5 w-20 rounded-md skeleton-shimmer" />
          <div className="h-5 w-16 rounded-md skeleton-shimmer" />
        </div>
        <div className="h-6 w-3/4 rounded-md skeleton-shimmer" />
        <div className="h-4 w-full rounded-md skeleton-shimmer" />
        <div className="h-4 w-2/3 rounded-md skeleton-shimmer" />
        <div className="mt-auto flex items-center justify-between">
          <div className="h-7 w-20 rounded skeleton-shimmer" />
          <div className="h-4 w-24 rounded skeleton-shimmer" />
        </div>
        <div className="h-9 w-full rounded-lg skeleton-shimmer" />
      </div>
    </div>
  );
}
