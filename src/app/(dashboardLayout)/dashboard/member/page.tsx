"use client";
import { useQuery } from "@tanstack/react-query";
import BookingService from "@/services/booking.service";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

const C = {
  bg:      "#0f1a0d",
  mid:     "#162513",
  surface: "#1c2f17",
  border:  "#2a3d22",
  green:   "#9AD872",
  forest:  "#468432",
  yellow:  "#FFEF91",
  orange:  "#FFA02E",
  fg:      "#f0f7ec",
  muted:   "#7a9c6e",
  dimmed:  "#4a6b40",
};

enum BookingStatus {
  PENDING   = "PENDING",
  CONFIRMED = "CONFIRMED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

function StatCard({ label, value, color, icon, sub }: { label: string; value: number; color: string; icon: string; sub?: string }) {
  return (
    <div
      className="rounded-2xl p-6 transition-all hover:-translate-y-0.5"
      style={{ background: C.mid, border: `1px solid ${C.border}` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ background: C.surface, border: `1px solid ${C.border}` }}
        >
          {icon}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.dimmed }}>
          Total
        </span>
      </div>
      <div className="font-display font-bold text-5xl leading-none mb-1" style={{ color }}>
        {value}
      </div>
      <div className="text-xs font-semibold uppercase tracking-wider mt-2" style={{ color: C.muted }}>
        {label}
      </div>
      {sub && (
        <div className="text-[10px] mt-1" style={{ color: C.dimmed }}>{sub}</div>
      )}
    </div>
  );
}

export default function MemberDashboardPage() {
  const { user } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["my-bookings"],
    queryFn:  () => BookingService.getMyBookings(),
  });

  const bookings = Array.isArray(data) ? data : (data as any)?.data ?? [];

  const confirmed = bookings.filter((b: any) => b.status === BookingStatus.CONFIRMED).length;
  const pending   = bookings.filter((b: any) => b.status === BookingStatus.PENDING).length;
  const completed = bookings.filter((b: any) => b.status === BookingStatus.COMPLETED).length;
  const cancelled = bookings.filter((b: any) => b.status === BookingStatus.CANCELLED).length;
  const total     = bookings.length;

  if (isLoading) {
    return (
      <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-36 rounded-2xl animate-pulse"
            style={{ background: C.mid }}
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="m-8 p-8 text-center rounded-2xl"
        style={{ background: C.mid, border: `1px solid ${C.border}` }}
      >
        <p className="font-bold" style={{ color: "#f87171" }}>Failed to load dashboard data</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6" style={{ background: C.bg, minHeight: "100vh" }}>
      {/* Header */}
      <div>
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-3"
          style={{ background: "rgba(154,216,114,0.1)", border: "1px solid rgba(154,216,114,0.25)", color: C.green }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.green }} />
          Member Area
        </div>
        <h1 className="font-display font-bold text-4xl leading-tight" style={{ color: C.fg }}>
          WELCOME BACK,{" "}
          <span style={{ color: C.green }}>{user?.name?.split(" ")[0]?.toUpperCase() ?? "MEMBER"}</span>
        </h1>
        <p className="mt-1 text-sm" style={{ color: C.muted }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Bookings"   value={total}     color={C.yellow} icon="📋" />
        <StatCard label="Confirmed"         value={confirmed}  color={C.green}  icon="✅" sub="Ready to attend" />
        <StatCard label="Pending"           value={pending}    color={C.orange} icon="⏳" sub="Awaiting confirmation" />
        <StatCard label="Completed"         value={completed}  color={C.muted}  icon="🏆" sub="Sessions done" />
      </div>

      {/* Recent bookings */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: C.mid, border: `1px solid ${C.border}` }}
      >
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <h2 className="font-display font-bold text-lg" style={{ color: C.fg }}>
            RECENT BOOKINGS
          </h2>
          <Link
            href="/dashboard/member/bookings"
            className="text-xs font-semibold transition-colors"
            style={{ color: C.green }}
          >
            View all →
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">📅</div>
            <p className="font-semibold" style={{ color: C.muted }}>No bookings yet</p>
            <p className="text-xs mt-1 mb-5" style={{ color: C.dimmed }}>Browse sessions and book your first one!</p>
            <Link
              href="/sessions"
              className="inline-block px-6 py-2.5 rounded-xl font-display font-bold text-sm tracking-widest transition-all active:scale-95"
              style={{ background: C.green, color: C.bg }}
            >
              EXPLORE SESSIONS
            </Link>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: C.border }}>
            {bookings.slice(0, 5).map((b: any) => {
              const statusColor: Record<string, string> = {
                CONFIRMED: C.green,
                PENDING:   C.orange,
                COMPLETED: C.muted,
                CANCELLED: "#f87171",
              };
              return (
                <div
                  key={b.id}
                  className="flex items-center justify-between px-6 py-4"
                >
                  <div>
                    <p className="text-sm font-semibold" style={{ color: C.fg }}>
                      {b.session?.title ?? b.sessionTitle ?? "Session"}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: C.dimmed }}>
                      {b.session?.date
                        ? new Date(b.session.date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
                        : "—"}
                    </p>
                  </div>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg"
                    style={{
                      color: statusColor[b.status] ?? C.muted,
                      background: `${statusColor[b.status] ?? C.muted}18`,
                      border: `1px solid ${statusColor[b.status] ?? C.muted}30`,
                    }}
                  >
                    {b.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: "/sessions",                    label: "Browse Sessions", icon: "🏋️" },
          { href: "/dashboard/member/bookings",   label: "My Bookings",     icon: "📅" },
          { href: "/dashboard/member/fitness",    label: "Fitness",         icon: "💪" },
          { href: "/dashboard/member/profile",    label: "My Profile",      icon: "👤" },
        ].map((q) => (
          <Link
            key={q.href}
            href={q.href}
            className="flex flex-col items-center gap-2 p-4 rounded-xl text-center transition-all hover:-translate-y-0.5"
            style={{ background: C.mid, border: `1px solid ${C.border}` }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = C.forest;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = C.border;
            }}
          >
            <span className="text-2xl">{q.icon}</span>
            <span className="text-xs font-semibold" style={{ color: C.muted }}>{q.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
