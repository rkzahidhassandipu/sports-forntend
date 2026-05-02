import Link from "next/link";
import { cn, formatCurrency } from "@/lib/utils";
import { Session } from "@/types/gym"; 
import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";

function StatusBadge({ status }: { status: string }) {


  return (
    <span
      className={cn(
        // Static layout classes (Ekhane kono background class rakhbe na)
        "text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#9AD872] text-lime-900 tracking-wider uppercase border",
        // Dynamic color classes (Ekhan theke background asche)
        
      )}
    >
      {status}
    </span>
  );
}
function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-amber-400 text-xs tracking-tighter">
      {"★".repeat(Math.floor(rating))}
      {"☆".repeat(5 - Math.floor(rating))}
    </span>
  );
}

interface SessionCardProps {
  session: Session;
  className?: string;
}


export function SessionCard({ session, className }: { session: any, className?: string }) {
  const router = useRouter();
  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => authService.getMe(),
    retry: false, 
    staleTime: 5 * 60 * 1000,
  });

  const handleBookingClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // ২. বাটনে ক্লিক করার পর চেক হবে ইউজার আছে কি না
    if (!user) {
      // যদি ইউজার না থাকে, তবে লগইন পেজে পাঠাবে
      const callbackUrl = `/sessions/booking?session=${session.id}`;
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    } else {
      // ইউজার থাকলে সরাসরি বুকিং পেজে যাবে
      router.push(`/sessions/booking?session=${session.id}`);
    }
  };

  return (
    <div className={cn("group flex flex-col bg-brand-mid border border-brand-border rounded-xl overflow-hidden", className)}>
      {/* ─── Image Header ─── */}
      <div className="relative h-40 overflow-hidden bg-brand-card flex-shrink-0">
        <img
          src={session?.coverImage ?? "/images/placeholder-session.jpg"}
          alt={session.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-mid/90 via-transparent to-black/20" />
      </div>

      {/* ─── Body ─── */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-display font-bold text-lg mb-1.5 text-foreground line-clamp-1">
          {session.title}
        </h3>

        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {session.description}
        </p>

        <div className="flex items-center justify-between mb-4 mt-auto">
          <span className="font-display font-black text-xl text-[#9AD872]">
            {formatCurrency(session.price)}
          </span>
        </div>

        <div className="flex gap-2">
          {/* এই বাটনটিই এখন লগইন প্রটেক্টেড */}
          <button
            onClick={handleBookingClick}
            className="flex-1 bg-[#9AD872] text-brand-dark font-display font-bold text-xs py-2.5 rounded-lg text-center hover:bg-lime-400 transition-all duration-200 active:scale-95 tracking-wide uppercase italic"
          >
            BOOK NOW
          </button>
          
          <Link
            href={`/sessions/${session.id}`}
            className="w-10 h-9 flex items-center justify-center rounded-lg border border-brand-border text-muted-foreground hover:bg-brand-card transition-all duration-200 text-sm"
          >
            👁️
          </Link>
        </div>
      </div>
    </div>
  );
}
export function SessionCardSkeleton() {
  return (
    <div className="flex flex-col bg-brand-mid border border-brand-border rounded-xl overflow-hidden h-[380px]">
      <div className="h-40 bg-brand-card skeleton-shimmer flex-shrink-0" />
      <div className="flex-1 p-4 flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="h-5 w-20 rounded-md bg-brand-card skeleton-shimmer" />
          <div className="h-5 w-16 rounded-md bg-brand-card skeleton-shimmer" />
        </div>
        <div className="h-6 w-3/4 rounded-md bg-brand-card skeleton-shimmer" />
        <div className="h-8 w-full rounded-md bg-brand-card skeleton-shimmer" />
        <div className="mt-auto flex items-center justify-between">
          <div className="h-7 w-20 rounded bg-brand-card skeleton-shimmer" />
          <div className="h-4 w-24 rounded bg-brand-card skeleton-shimmer" />
        </div>
        <div className="h-9 w-full rounded-lg bg-brand-card skeleton-shimmer" />
      </div>
    </div>
  );
}
