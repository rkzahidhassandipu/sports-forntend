"use client";

import React, { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  Loader2,
  Inbox,
  Activity,
  RefreshCcw,
  UserCheck,
  Timer,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  AlertTriangle,
  ChevronDown,
  Sparkles,
  RefreshCw,
  X,
  Check,
  User as UserIcon,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Shield,
} from "lucide-react";
import BookingService from "@/services/booking.service";
import UserService from "@/services/user.service";
import { Booking } from "@/types/booking";
import type { User } from "@/types/user";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BookingFilters {
  status: string;
  userId: string;
  page: number;
}

interface StatusConfig {
  label: string;
  color: string;
  badgeColor: string;
  icon: React.ElementType;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const STATUS_MAP: Record<string, StatusConfig> = {
  PENDING: {
    label: "Pending",
    color: "text-amber-400 bg-amber-400/10 border-amber-400/25 hover:bg-amber-400/20",
    badgeColor: "text-amber-400 bg-amber-400/10 border border-amber-400/20",
    icon: Clock,
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "text-[#9AD872] bg-[#9AD872]/10 border-lime-400/25 hover:bg-[#9AD872]/20",
    badgeColor: "text-[#9AD872] bg-[#9AD872]/10 border border-lime-400/20",
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "text-rose-400 bg-rose-400/10 border-rose-400/25 hover:bg-rose-400/20",
    badgeColor: "text-rose-400 bg-rose-400/10 border border-rose-400/20",
    icon: XCircle,
  },
  COMPLETED: {
    label: "Completed",
    color: "text-sky-400 bg-sky-400/10 border-sky-400/25 hover:bg-sky-400/20",
    badgeColor: "text-sky-400 bg-sky-400/10 border border-sky-400/20",
    icon: UserCheck,
  },
  NO_SHOW: {
    label: "No Show",
    color: "text-zinc-400 bg-zinc-400/10 border-zinc-400/25 hover:bg-zinc-400/20",
    badgeColor: "text-zinc-400 bg-zinc-400/10 border border-zinc-400/20",
    icon: Timer,
  },
};

const PAYMENT_STATUS_STYLE: Record<string, string> = {
  PAID: "text-[#9AD872] bg-[#9AD872]/10 border border-lime-400/20",
  UNPAID: "text-zinc-500 bg-zinc-500/10 border border-zinc-500/20",
  REFUNDED: "text-sky-400 bg-sky-400/10 border border-sky-400/20",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function safeFormat(
  dateStr: string | null | undefined,
  fmt: string,
  fallback = "—",
): string {
  if (!dateStr) return fallback;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? fallback : format(d, fmt);
}

function getInitials(name: string) {
  return (
    (name ?? "?")
      .split(" ")
      .map((w) => w[0] ?? "")
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?"
  );
}

// ─── Shared Badges ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_MAP[status] ?? STATUS_MAP.PENDING;
  const Icon = cfg.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest", cfg.badgeColor)}>
      <Icon size={10} strokeWidth={2.5} />
      {cfg.label}
    </span>
  );
}

function PaymentBadge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest", PAYMENT_STATUS_STYLE[status] ?? "text-zinc-500 border border-zinc-700")}>
      <CreditCard size={9} strokeWidth={2.5} />
      {status}
    </span>
  );
}

// ─── AI Markdown Renderer ─────────────────────────────────────────────────────

function renderMarkdown(text: string): string {
  return text
    .split("\n")
    .map((line) => {
      if (line.startsWith("## "))
        return `<p class="text-[10px] font-black uppercase tracking-widest text-zinc-500 mt-5 mb-2">${line.slice(3)}</p>`;
      if (line.startsWith("### "))
        return `<p class="text-[10px] font-black uppercase tracking-widest text-zinc-600 mt-3 mb-1">${line.slice(4)}</p>`;
      if (line.startsWith("- ") || line.startsWith("* "))
        return `<div class="flex gap-2 my-0.5"><span class="text-zinc-600 mt-0.5 shrink-0">•</span><span class="text-xs text-zinc-400 leading-relaxed">${line.slice(2).replace(/\*\*(.+?)\*\*/g, '<strong class="text-zinc-200">$1</strong>')}</span></div>`;
      if (/^\d+\.\s/.test(line))
        return `<div class="flex gap-2 my-0.5"><span class="text-[10px] font-black text-zinc-600 mt-0.5 shrink-0">${line.match(/^\d+/)![0]}.</span><span class="text-xs text-zinc-400 leading-relaxed">${line.replace(/^\d+\.\s/, "").replace(/\*\*(.+?)\*\*/g, '<strong class="text-zinc-200">$1</strong>')}</span></div>`;
      if (line.trim() === "") return `<div class="h-1"></div>`;
      return `<p class="text-xs text-zinc-400 leading-relaxed">${line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-zinc-200">$1</strong>')}</p>`;
    })
    .join("");
}

// ─── User + AI Modal ──────────────────────────────────────────────────────────

function UserAIModal({
  userId,
  booking,
  onClose,
}: {
  userId: string;
  booking: Booking;
  onClose: () => void;
}) {
  const [analysis, setAnalysis] = useState("");
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  // Fetch user by id
  const { data: userData, isLoading: isUserLoading, isError: isUserError } = useQuery({
    queryKey: ["user-by-id", userId],
    queryFn: () => UserService.getUserById(userId),
    enabled: !!userId,
  });

  // Handle both direct User and { data: User } shapes
  const user = ((userData as any)?.data ?? userData) as User | null | undefined;

  async function runAnalysis() {
    if (!user) return;
    setIsAnalysing(true);
    setAnalysis("");
    setHasRun(true);

    const prompt = `You are an intelligent analyst for a fitness booking admin dashboard.

Analyze this member's profile and their booking behaviour. Provide a concise, actionable report covering:

1. **Member Profile** — Who is this user? Profile completeness, verification status, account health.
2. **Booking Context** — What does this specific booking tell us? Session type, payment status, booking status.
3. **Risk Signals** — Any concerns? (unverified email, unpaid bookings, no-show history, suspended account, etc.)
4. **Engagement Score** — Based on available data, how engaged is this member? (High / Medium / Low) and why.
5. **Admin Recommendations** — 2–3 specific actions the admin should consider for this user.

Keep it concise and professional. Use ## for sections and **bold** for key terms.

Member Data:
- Name: ${user.name}
- Email: ${user.email}
- Phone: ${user.phone ?? "Not provided"}
- Role: ${user.role}
- Status: ${user.status}
- Email Verified: ${user.emailVerified ? "Yes" : "No"}
- Bio: ${user.bio ?? "Not provided"}
- Member Since: ${safeFormat(user.createdAt, "dd MMM yyyy")}
- Last Login: ${user.lastLoginAt ? safeFormat(user.lastLoginAt, "dd MMM yyyy, HH:mm") : "Never"}
- City: ${user.profile?.city ?? "Not provided"}
- Country: ${user.profile?.country ?? "Not provided"}
- Total Bookings: ${user._count?.bookings ?? "Unknown"}
- Total Reviews: ${user._count?.reviews ?? "Unknown"}

Current Booking:
- Session: ${booking.session?.title ?? "Unknown"}
- Booking Status: ${booking.status}
- Payment Status: ${booking.paymentStatus}
- Amount: $${Number(booking.totalAmount).toFixed(2)}
- Booked At: ${safeFormat(booking.createdAt, "dd MMM yyyy, HH:mm")}
- Cancel Reason: ${booking.cancelReason ?? "N/A"}
- Notes: ${booking.notes ?? "None"}`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await response.json();
      const text =
        data.content
          ?.filter((b: any) => b.type === "text")
          .map((b: any) => b.text)
          .join("") ?? "No analysis returned.";
      setAnalysis(text);
    } catch {
      setAnalysis("⚠️ Failed to run analysis. Please try again.");
    } finally {
      setIsAnalysing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] shrink-0">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Member Overview</p>
            <p className="text-sm font-black text-[#f0f7ec] mt-0.5">
              {booking.session?.title ?? "Session"} Booking
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-zinc-800 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-[#f0f7ec] transition-colors"
          >
            <X size={13} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* User loading */}
          {isUserLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={22} className="animate-spin text-[#9AD872]" />
            </div>
          )}

          {/* User error */}
          {isUserError && (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <AlertTriangle size={22} className="text-rose-400" />
              <p className="text-xs text-zinc-600">Could not load member profile.</p>
            </div>
          )}

          {/* User loaded */}
          {!isUserLoading && user && (
            <>
              {/* Member card */}
              <div className="flex items-start gap-4 p-4 bg-zinc-800/40 border border-white/[0.06] rounded-xl">
                {/* Avatar */}
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-[#9AD872]/10 border border-lime-400/20 flex items-center justify-center shrink-0">
                    <span className="text-sm font-black text-[#9AD872]">{getInitials(user.name)}</span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-black text-[#f0f7ec]">{user.name}</p>
                      <p className="text-[11px] text-zinc-600 mt-0.5">{user.email}</p>
                    </div>
                    <p className="text-[10px] text-zinc-700 shrink-0">
                      {user.lastLoginAt
                        ? `Last seen ${safeFormat(user.lastLoginAt, "dd MMM")}`
                        : "Never logged in"}
                    </p>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md bg-[#9AD872]/10 border border-lime-400/20 text-[10px] font-black uppercase tracking-widest text-[#9AD872]">
                      {user.role}
                    </span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-md border text-[10px] font-black uppercase tracking-widest",
                      user.status === "ACTIVE"
                        ? "bg-emerald-400/10 border-emerald-400/20 text-emerald-400"
                        : "bg-zinc-500/10 border-zinc-500/20 text-zinc-500",
                    )}>
                      {user.status}
                    </span>
                    {user.emailVerified && (
                      <span className="px-2 py-0.5 rounded-md bg-sky-400/10 border border-sky-400/20 text-[10px] font-black uppercase tracking-widest text-sky-400 flex items-center gap-1">
                        <Check size={9} /> Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Bookings", value: user._count?.bookings ?? "—" },
                  { label: "Reviews",  value: user._count?.reviews  ?? "—" },
                  { label: "Sessions", value: user._count?.sessions ?? "—" },
                  { label: "Joined",   value: safeFormat(user.createdAt, "MMM yy") },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col items-center gap-0.5 py-3 bg-zinc-800/50 border border-white/[0.04] rounded-xl">
                    <p className="text-sm font-black text-[#f0f7ec]">{value}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600">{label}</p>
                  </div>
                ))}
              </div>

              {/* Booking summary */}
              <div className="p-4 bg-zinc-800/30 border border-white/[0.05] rounded-xl space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-3">This Booking</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  {[
                    ["Session",  booking.session?.title ?? "—"],
                    ["Amount",   `$${Number(booking.totalAmount).toFixed(2)}`],
                    ["Status",   null],
                    ["Payment",  null],
                    ["Booked",   safeFormat(booking.createdAt, "dd MMM yyyy, HH:mm")],
                    ["Reason",   booking.cancelReason ?? "—"],
                  ].map(([label, value]) => (
                    <div key={label as string} className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-700">{label}</span>
                      {label === "Status"  ? <StatusBadge  status={booking.status}        /> :
                       label === "Payment" ? <PaymentBadge status={booking.paymentStatus} /> :
                       <span className="text-xs text-zinc-400">{value}</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* AI section */}
              {!hasRun && (
                <div className="flex flex-col items-center justify-center py-8 text-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#9AD872]/10 border border-lime-400/20 flex items-center justify-center">
                    <Sparkles size={20} className="text-[#9AD872]" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-[#f0f7ec]">AI Member Analysis</p>
                    <p className="text-xs text-zinc-600 mt-1 max-w-xs leading-relaxed">
                      Get AI insights on this member — engagement score, risk signals & admin recommendations.
                    </p>
                  </div>
                  <button
                    onClick={runAnalysis}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#9AD872] hover:bg-lime-300 text-black text-xs font-black uppercase tracking-widest transition-colors"
                  >
                    <Sparkles size={12} />
                    Run Analysis
                  </button>
                </div>
              )}

              {isAnalysing && (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <Loader2 size={22} className="animate-spin text-[#9AD872]" />
                  <p className="text-xs text-zinc-600">Analysing member…</p>
                </div>
              )}

              {!isAnalysing && hasRun && analysis && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles size={11} className="text-[#9AD872]" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        Analysis Result
                      </p>
                    </div>
                    <button
                      onClick={runAnalysis}
                      className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-[#9AD872] transition-colors"
                    >
                      <RefreshCw size={9} />
                      Re-run
                    </button>
                  </div>
                  <div
                    className="p-4 bg-zinc-800/40 border border-white/[0.05] rounded-xl"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(analysis) }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Booking Detail Drawer (unchanged) ───────────────────────────────────────

function BookingDetailDrawer({
  booking,
  onClose,
}: {
  booking: Booking;
  onClose: () => void;
}) {
  const rows: [string, React.ReactNode][] = [
    ["Booking ID",   <span className="font-mono text-xs">{booking.id}</span>],
    ["Session",      booking.session?.title ?? "—"],
    ["User ID",      <span className="font-mono text-xs">{booking.userId}</span>],
    ["Amount",       `$${Number(booking.totalAmount).toFixed(2)}`],
    ["Payment",      <PaymentBadge status={booking.paymentStatus} />],
    ["Status",       <StatusBadge  status={booking.status} />],
    ["Booked At",    booking.createdAt    ? format(new Date(booking.createdAt),    "dd MMM yyyy, HH:mm") : "—"],
    ["Confirmed At", booking.confirmedAt  ? format(new Date(booking.confirmedAt),  "dd MMM yyyy, HH:mm") : "—"],
    ["Cancelled At", booking.cancelledAt  ? format(new Date(booking.cancelledAt),  "dd MMM yyyy, HH:mm") : "—"],
    ["Cancel Reason", booking.cancelReason ?? "—"],
    ["Notes",        booking.notes ?? "—"],
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-zinc-950 border-l border-white/5 flex flex-col h-full overflow-auto">
        <div className="sticky top-0 bg-zinc-950 border-b border-white/5 px-6 py-5 flex items-center justify-between z-10">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Booking Detail</p>
            <p className="text-lg font-black text-[#f0f7ec] mt-0.5 truncate">
              {booking.session?.title ?? "Session"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-[#f0f7ec] transition-colors"
          >
            <XCircle size={14} />
          </button>
        </div>
        <div className="flex-1 p-6 space-y-3">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-3 border-b border-white/[0.04] last:border-0">
              <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-600 shrink-0 pt-0.5">{label}</span>
              <span className="text-xs text-zinc-300 text-right leading-relaxed">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminBookingManagement() {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<BookingFilters>({ status: "", userId: "", page: 1 });
  const [userIdInput, setUserIdInput] = useState("");

  // Two separate modals
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);
  const [aiBooking,     setAiBooking]     = useState<Booking | null>(null);

  const handleUserIdChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUserIdInput(val);
    setFilters((prev) => ({ ...prev, userId: val, page: 1 }));
  }, []);

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ["admin-bookings", filters],
    queryFn: () =>
      BookingService.getAllBookings({
        status: filters.status || undefined,
        userId: filters.userId || undefined,
        page:   filters.page,
        limit:  PAGE_SIZE,
      }),
    placeholderData: (prev) => prev,
  });

  const bookings: Booking[] = Array.isArray(data) ? data : (data as any)?.data ?? [];
  const meta        = Array.isArray(data) ? null : (data as any)?.meta;
  const totalPages  = meta?.totalPages ?? 1;

  const { mutate: updateStatus, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      BookingService.updateStatus(id, { status: status as any }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      toast.success("Status updated");
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message ?? "Failed to update status"),
  });

  const handleFilterChange = (key: keyof BookingFilters, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));

  return (
    <>
      {/* Detail drawer */}
      {detailBooking && (
        <BookingDetailDrawer
          booking={detailBooking}
          onClose={() => setDetailBooking(null)}
        />
      )}

      {/* AI modal */}
      {aiBooking && (
        <UserAIModal
          userId={aiBooking.userId}
          booking={aiBooking}
          onClose={() => setAiBooking(null)}
        />
      )}

      <div className="min-h-screen bg-black text-[#f0f7ec] p-6 md:p-10">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Admin Panel</p>
              <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-3 leading-none">
                Booking{" "}
                <span className="text-[#9AD872] underline decoration-zinc-800">Ledger</span>
                {isFetching && !isLoading && (
                  <RefreshCcw size={14} className="animate-spin text-zinc-600" style={{ fontStyle: "normal" }} />
                )}
              </h1>
              <p className="text-zinc-600 text-xs font-medium tracking-wide">
                Manage all member session reservations and payment records.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={13} />
                <input
                  className="w-full md:w-56 bg-zinc-900 border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#f0f7ec] placeholder-zinc-700 outline-none focus:border-[#9AD872]/40 transition-colors"
                  placeholder="Search by User ID…"
                  value={userIdInput}
                  onChange={handleUserIdChange}
                />
              </div>
              <select
                className="bg-zinc-900 border border-white/5 rounded-xl px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 outline-none cursor-pointer hover:border-white/10 transition-colors"
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <option value="">All Statuses</option>
                {Object.keys(STATUS_MAP).map((s) => (
                  <option key={s} value={s}>{STATUS_MAP[s].label}</option>
                ))}
              </select>
            </div>
          </header>

          {/* Stats bar */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {Object.entries(STATUS_MAP).map(([key, cfg]) => {
              const Icon = cfg.icon;
              const count = bookings.filter((b) => b.status === key).length;
              return (
                <button
                  key={key}
                  onClick={() => handleFilterChange("status", filters.status === key ? "" : key)}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-xl border text-left transition-all",
                    filters.status === key
                      ? cfg.color
                      : "bg-zinc-900/50 border-white/5 text-zinc-600 hover:bg-zinc-900 hover:border-white/10",
                  )}
                >
                  <Icon size={12} strokeWidth={2.5} />
                  <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-widest truncate">{cfg.label}</p>
                    <p className="text-sm font-black leading-none mt-0.5">{count}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Table */}
          <div className="bg-zinc-950 border border-white/[0.05] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.05] bg-zinc-900/30">
                    {["Session & Member", "Date", "Transaction", "Status", "Change Status", "Details", "AI View"].map((h, i) => (
                      <th
                        key={h}
                        className={cn(
                          "px-5 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600",
                          i >= 4 ? "text-right" : "text-left",
                        )}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {isLoading && (
                    <tr>
                      <td colSpan={7} className="py-24 text-center">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#9AD872] mb-3" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700">Loading records…</p>
                      </td>
                    </tr>
                  )}
                  {isError && !isLoading && (
                    <tr>
                      <td colSpan={7} className="py-24 text-center">
                        <AlertTriangle className="mx-auto mb-3 text-rose-500" size={28} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Failed to load bookings</p>
                      </td>
                    </tr>
                  )}
                  {!isLoading && !isError && bookings.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-24 text-center">
                        <Inbox className="mx-auto mb-3 text-zinc-800" size={32} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700">No records match your filters</p>
                      </td>
                    </tr>
                  )}
                  {!isLoading && !isError && bookings.map((booking) => (
                    <BookingRow
                      key={booking.id}
                      booking={booking}
                      isUpdating={isUpdating}
                      onStatusChange={(id, status) => updateStatus({ id, status })}
                      onViewDetails={setDetailBooking}
                      onAIView={setAiBooking}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="border-t border-white/[0.05] px-5 py-4 flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700">
                  Page {filters.page} of {totalPages}
                </p>
                <div className="flex gap-1">
                  <button
                    disabled={filters.page <= 1}
                    onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
                    className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-[#f0f7ec] disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft size={13} />
                  </button>
                  <button
                    disabled={filters.page >= totalPages}
                    onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
                    className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-[#f0f7ec] disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.3em] text-zinc-800 italic px-1">
            <div className="flex items-center gap-2">
              <Activity size={10} /> Live System — Operational
            </div>
            <div>{bookings.length} record{bookings.length !== 1 ? "s" : ""} shown</div>
          </div>

        </div>
      </div>
    </>
  );
}

// ─── BookingRow ───────────────────────────────────────────────────────────────

const BookingRow = React.memo(function BookingRow({
  booking,
  isUpdating,
  onStatusChange,
  onViewDetails,
  onAIView,
}: {
  booking: Booking;
  isUpdating: boolean;
  onStatusChange: (id: string, status: string) => void;
  onViewDetails:  (b: Booking) => void;
  onAIView:       (b: Booking) => void;
}) {
  const cfg = STATUS_MAP[booking.status] ?? STATUS_MAP.PENDING;

  return (
    <tr className="group hover:bg-zinc-900/20 transition-colors">
      {/* Session & Member */}
      <td className="px-5 py-5">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-bold text-[#f0f7ec] leading-tight">
            {booking.session?.title ?? "Session"}
          </span>
          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider font-mono">
            …{booking.userId.slice(-10)}
          </span>
        </div>
      </td>

      {/* Date */}
      <td className="px-5 py-5">
        <span className="text-xs text-zinc-500">
          {booking.createdAt ? format(new Date(booking.createdAt), "dd MMM yyyy") : "—"}
        </span>
      </td>

      {/* Transaction */}
      <td className="px-5 py-5">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-black text-[#f0f7ec]">
            ${Number(booking.totalAmount).toFixed(2)}
          </span>
          <PaymentBadge status={booking.paymentStatus} />
        </div>
      </td>

      {/* Current status badge */}
      <td className="px-5 py-5">
        <StatusBadge status={booking.status} />
      </td>

      {/* Change status dropdown */}
      <td className="px-5 py-5 text-right">
        <div className="relative inline-flex items-center">
          <select
            disabled={isUpdating}
            value={booking.status}
            onChange={(e) => onStatusChange(booking.id, e.target.value)}
            className={cn(
              "appearance-none pl-3 pr-7 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-wider outline-none cursor-pointer transition-all disabled:opacity-50",
              cfg.color,
            )}
          >
            {Object.keys(STATUS_MAP).map((s) => (
              <option key={s} value={s} className="bg-zinc-900 text-[#f0f7ec] normal-case tracking-normal">
                {STATUS_MAP[s].label}
              </option>
            ))}
          </select>
          <ChevronDown size={10} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 opacity-60" />
        </div>
      </td>

      {/* Detail drawer button */}
      <td className="px-5 py-5 text-right">
        <button
          onClick={() => onViewDetails(booking)}
          title="Booking Details"
          className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-600 hover:text-[#f0f7ec] hover:border-white/10 transition-all ml-auto"
        >
          <ArrowUpRight size={13} />
        </button>
      </td>

      {/* AI View button — NEW */}
      <td className="px-5 py-5 text-right">
        <button
          onClick={() => onAIView(booking)}
          title="AI Member Analysis"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/5 hover:border-lime-400/30 hover:bg-[#9AD872]/5 hover:text-[#9AD872] text-[10px] font-black uppercase tracking-widest text-zinc-500 transition-all ml-auto"
        >
          <Sparkles size={10} />
          AI View
        </button>
      </td>
    </tr>
  );
});