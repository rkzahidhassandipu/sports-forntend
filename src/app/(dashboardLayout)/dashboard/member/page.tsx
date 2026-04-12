"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import BookingService from "@/services/booking.service";
import FitnessService from "@/services/fitness.service";
import { Booking } from "@/types/gym";
import { BookingStatus } from "@/types/enums";

const BOOKING_STATUS_STYLES: Record<string, string> = {
  CONFIRMED:  "bg-emerald-50 text-emerald-600 border-emerald-200",
  PENDING:    "bg-amber-50   text-amber-600   border-amber-200",
  CANCELLED:  "bg-rose-50    text-rose-600    border-rose-200",
  COMPLETED:  "bg-slate-100  text-slate-500   border-slate-200",
};

export default function MemberDashboardPage() {
  const { user } = useAuth();

  const { data: bookings = [], isLoading: loadingBookings } = useQuery<Booking[]>({
    queryKey: ["my-bookings"],
    queryFn: () => BookingService.getMyBookings(),
  });

  const { data: progress, isLoading: loadingProgress } = useQuery({
    queryKey: ["my-progress"],
    queryFn: () => FitnessService.getMyProgress(),
  });

  const confirmedCount  = bookings.filter((b) => b.status === BookingStatus.CONFIRMED).length;
  const pendingCount    = bookings.filter((b) => b.status === BookingStatus.PENDING).length;
  const completedCount  = bookings.filter((b) => b.status === BookingStatus.COMPLETED).length;

  const STATS = [
    { label: "Upcoming Sessions", value: confirmedCount, icon: "📅", color: "text-blue-600",    bg: "bg-blue-50" },
    { label: "Pending Payment",   value: pendingCount,   icon: "⏳", color: "text-amber-600",   bg: "bg-amber-50" },
    { label: "Completed",         value: completedCount, icon: "✅", color: "text-emerald-600", bg: "bg-emerald-50" },
    {
      label: "Weight Trend",
      value: progress ? `${progress.weightChange > 0 ? "+" : ""}${progress.weightChange} kg` : "–",
      icon: "💪",
      color: progress?.weightChange && progress.weightChange < 0 ? "text-lime-600" : "text-purple-600",
      bg:    "bg-purple-50",
    },
  ];

  return (
    <div className="p-6 lg:p-10 space-y-8 bg-[#f8fafc] min-h-screen text-slate-900">

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Welcome back, <span className="text-lime-600">{user?.name?.split(" ")[0] ?? "Member"}</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Here's a summary of your activity and upcoming sessions.
          </p>
        </div>
        <a
          href="/sessions"
          className="px-5 py-2.5 bg-slate-900 text-white hover:bg-black rounded-xl text-sm font-bold transition-all shadow-lg shadow-slate-200"
        >
          Browse Sessions
        </a>
      </header>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat, i) => (
          <div key={i} className="p-6 rounded-3xl bg-white border border-slate-200/60 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className={cn("p-2.5 rounded-xl text-xl", stat.bg, stat.color)}>{stat.icon}</span>
            </div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.15em]">{stat.label}</p>
            <h2 className="text-2xl font-black mt-1 text-slate-900">
              {loadingBookings || loadingProgress ? (
                <span className="inline-block w-12 h-6 bg-slate-100 animate-pulse rounded" />
              ) : (
                stat.value
              )}
            </h2>
          </div>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-lg text-slate-900">My Recent Bookings</h3>
          <a href="/dashboard/admin/bookings" className="text-xs font-bold text-lime-600 hover:underline">
            View All →
          </a>
        </div>

        {loadingBookings ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-slate-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-4xl mb-3">📋</p>
            <p className="font-bold">No bookings yet.</p>
            <p className="text-sm mt-1">Browse sessions and book your first class!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {bookings.slice(0, 5).map((booking) => (
              <div key={booking.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/40 transition-colors">
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Session #{booking.sessionId.slice(0, 8)}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    {new Date(booking.createdAt).toLocaleDateString("en-US", {
                      weekday: "short", month: "short", day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-black text-slate-900">
                    ${booking.totalAmount.toFixed(2)}
                  </span>
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-tighter",
                      BOOKING_STATUS_STYLES[booking.status] ?? "bg-slate-100 text-slate-500",
                    )}
                  >
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
