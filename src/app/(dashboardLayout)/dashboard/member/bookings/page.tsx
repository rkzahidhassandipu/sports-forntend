"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import BookingService from "@/services/booking.service";
import PaymentService from "@/services/payment.service";
import { Booking } from "@/types/booking";
import { BookingStatus, PaymentStatus } from "@/types/enums";
import { api } from "@/lib/api";

// ─── Invoice PDF Generator ─────────────────────────────────────────────────────

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  customer: { name: string; email: string };
  session: {
    title: string;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
    location: string | null;
    price: string;
    category: string;
    level: string;
    coach: { name: string };
  };
  amount: string;
  currency: string;
  status: string;
  method: string;
}

async function fetchInvoiceData(paymentId: string): Promise<InvoiceData> {
  const { data } = await api.get(`/payments/my/invoice/${paymentId}`);
  return data.data;
}

async function generateInvoicePDF(paymentId: string): Promise<void> {
  const [{ jsPDF }, inv] = await Promise.all([
    import("jspdf"),
    fetchInvoiceData(paymentId),
  ]);

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const MARGIN = 48;
  const COL2 = W / 2 + 20;
  let y = 0;

  const currency = inv.currency?.toUpperCase() ?? "USD";
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);
  const fmtDate = (s: string) =>
    new Date(s).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  const fmtTime = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
  };

  // Header bar
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, W, 72, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("INVOICE", MARGIN, 44);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.text("FitBook — Session Management", W - MARGIN, 44, { align: "right" });

  y = 100;

  // Invoice meta (left)
  const meta: [string, string][] = [
    ["INVOICE NUMBER", inv.invoiceNumber],
    ["DATE ISSUED", fmtDate(inv.date)],
    ["STATUS", inv.status],
    ["PAYMENT METHOD", inv.method],
  ];
  meta.forEach(([label, val]) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(label, MARGIN, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(val, MARGIN, y + 13);
    y += 30;
  });

  // Customer (right)
  let ry = 100;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("BILLED TO", COL2, ry);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(inv.customer.name, COL2, ry + 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.text(inv.customer.email, COL2, ry + 30);

  y = Math.max(y, ry + 50) + 16;

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y, W - MARGIN, y);
  y += 24;

  // Session details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Session Details", MARGIN, y);
  y += 20;

  const cardH = 110;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.roundedRect(MARGIN, y, W - MARGIN * 2, cardH, 6, 6, "FD");

  const cx = MARGIN + 16;
  let cy = y + 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(inv.session.title, cx, cy);
  cy += 4;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(inv.session.description, cx, cy + 12, {
    maxWidth: W - MARGIN * 2 - 32,
  });
  cy += 28;

  const sessionMeta: [string, string][] = [
    ["Date", fmtDate(inv.session.date)],
    [
      "Time",
      `${fmtTime(inv.session.startTime)} – ${fmtTime(inv.session.endTime)} (${inv.session.duration} min)`,
    ],
    ["Coach", inv.session.coach.name],
    ["Category", `${inv.session.category} · ${inv.session.level}`],
    ...(inv.session.location
      ? [["Location", inv.session.location] as [string, string]]
      : []),
  ];

  const colW = (W - MARGIN * 2 - 32) / 2;
  sessionMeta.forEach(([label, val], i) => {
    const lx = cx + (i % 2) * colW;
    const ly = cy + Math.floor(i / 2) * 18;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(label.toUpperCase(), lx, ly);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text(val, lx, ly + 11);
  });

  y += cardH + 24;

  // Summary table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Summary", MARGIN, y);
  y += 14;

  doc.setFillColor(15, 23, 42);
  doc.rect(MARGIN, y, W - MARGIN * 2, 22, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("DESCRIPTION", MARGIN + 10, y + 14);
  doc.text("QTY", W - MARGIN - 140, y + 14);
  doc.text("UNIT PRICE", W - MARGIN - 90, y + 14);
  doc.text("TOTAL", W - MARGIN - 10, y + 14, { align: "right" });
  y += 22;

  doc.setFillColor(248, 250, 252);
  doc.rect(MARGIN, y, W - MARGIN * 2, 28, "F");
  doc.setDrawColor(226, 232, 240);
  doc.rect(MARGIN, y, W - MARGIN * 2, 28);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(inv.session.title, MARGIN + 10, y + 17);
  doc.text("1", W - MARGIN - 140, y + 17);
  doc.text(fmt(Number(inv.session.price)), W - MARGIN - 90, y + 17);
  doc.text(fmt(Number(inv.amount)), W - MARGIN - 10, y + 17, {
    align: "right",
  });
  y += 28;

  y += 10;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(W - MARGIN - 180, y, W - MARGIN, y);
  y += 14;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text("Subtotal", W - MARGIN - 130, y);
  doc.text(fmt(Number(inv.amount)), W - MARGIN - 10, y, { align: "right" });
  y += 16;

  doc.text("Tax (0%)", W - MARGIN - 130, y);
  doc.text(fmt(0), W - MARGIN - 10, y, { align: "right" });
  y += 10;

  doc.setLineWidth(1);
  doc.setDrawColor(15, 23, 42);
  doc.line(W - MARGIN - 180, y, W - MARGIN, y);
  y += 14;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Total", W - MARGIN - 130, y);
  doc.text(fmt(Number(inv.amount)), W - MARGIN - 10, y, { align: "right" });

  // PAID stamp
  if (inv.status === "PAID") {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(36);
    doc.setTextColor(16, 185, 129);
    doc.setGState(doc.GState({ opacity: 0.12 }));
    doc.text("PAID", W / 2, 420, { align: "center", angle: 345 });
    doc.setGState(doc.GState({ opacity: 1 }));
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 36;
  doc.setFillColor(248, 250, 252);
  doc.rect(0, footerY - 10, W, 46, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Generated on ${new Date().toLocaleString()} · Invoice ${inv.invoiceNumber}`,
    W / 2,
    footerY + 8,
    { align: "center" }
  );

  doc.save(`${inv.invoiceNumber}.pdf`);
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatAmount(amount: number | string) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Status Config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { label: string; dot: string; pill: string }
> = {
  [BookingStatus.CONFIRMED]: {
    label: "Confirmed",
    dot: "bg-emerald-500",
    pill: "bg-emerald-50 text-emerald-700 ring-[0.5px] ring-emerald-300",
  },
  [BookingStatus.PENDING]: {
    label: "Pending",
    dot: "bg-amber-400",
    pill: "bg-amber-50 text-amber-700 ring-[0.5px] ring-amber-300",
  },
  [BookingStatus.COMPLETED]: {
    label: "Completed",
    dot: "bg-blue-400",
    pill: "bg-blue-50 text-blue-700 ring-[0.5px] ring-blue-300",
  },
  [BookingStatus.CANCELLED]: {
    label: "Cancelled",
    dot: "bg-red-400",
    pill: "bg-red-50 text-red-700 ring-[0.5px] ring-red-300",
  },
};

function getStatus(status: string) {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG[BookingStatus.PENDING];
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-[#2a3d22] bg-[#162513] px-4 py-3.5 shadow-sm">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-[#4a6b40]">
        {label}
      </p>
      <p className={`text-3xl font-semibold tabular-nums ${accent}`}>{value}</p>
    </div>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="animate-pulse rounded-2xl border border-[#2a3d22] bg-[#162513] p-5">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-3 w-32 rounded bg-[#1c2f17]" />
          <div className="h-5 w-24 rounded bg-[#1c2f17]" />
          <div className="h-3 w-20 rounded bg-[#1c2f17]" />
        </div>
        <div className="h-9 w-24 rounded-xl bg-[#1c2f17]" />
      </div>
    </div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ filter }: { filter: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#2a3d22] bg-[#162513] text-xl shadow-sm">
        📋
      </div>
      <p className="text-sm text-[#4a6b40]">
        No {filter !== "ALL" ? filter.toLowerCase() : ""} bookings found
      </p>
    </div>
  );
}

// ─── Cancel Modal ──────────────────────────────────────────────────────────────

interface CancelModalProps {
  booking: Booking | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isPending: boolean;
}

function CancelModal({
  booking,
  onClose,
  onConfirm,
  isPending,
}: CancelModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!booking) return null;

  function handleConfirm() {
    if (!reason.trim()) {
      setError("Please provide a reason.");
      return;
    }
    setError("");
    onConfirm(reason.trim());
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-[#2a3d22] bg-[#162513] p-6 shadow-2xl">
        <h3 className="text-sm font-semibold text-[#f0f7ec]">Cancel booking</h3>
        <p className="mt-0.5 font-mono text-[11px] text-[#2a3d22]">
          {booking.id}
        </p>

        <div className="my-4 h-px w-full bg-[#1c2f17]" />

        <label className="mb-1.5 block text-xs font-medium text-[#7a9c6e]">
          Reason for cancellation
        </label>
        <textarea
          rows={3}
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            setError("");
          }}
          placeholder="e.g. Schedule conflict…"
          className="w-full resize-none rounded-xl border border-[#2a3d22] bg-[#1c2f17] px-3 py-2.5 text-sm text-[#f0f7ec] placeholder-gray-300 outline-none transition focus:border-gray-400 focus:bg-[#162513]"
        />
        {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}

        <div className="mt-4 flex gap-2">
          <button
            onClick={handleConfirm}
            disabled={isPending}
            className="flex-1 rounded-xl bg-red-50 py-2.5 text-xs font-semibold text-red-600 ring-[0.5px] ring-red-200 transition hover:bg-red-100 disabled:opacity-50"
          >
            {isPending ? "Cancelling…" : "Confirm cancel"}
          </button>
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex-1 rounded-xl border border-[#2a3d22] py-2.5 text-xs font-medium text-[#7a9c6e] transition hover:bg-[#1c2f17] disabled:opacity-50"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Payment Section ───────────────────────────────────────────────────────────

interface PaymentSectionProps {
  booking: Booking;
  onPay: () => void;
  onCancel: () => void;
  isPayPending: boolean;
}

function PaymentSection({
  booking,
  onPay,
  onCancel,
  isPayPending,
}: PaymentSectionProps) {
  return (
    <div className="border-t border-amber-200 bg-amber-50/60 px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-[#162513]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-4 w-4 text-amber-600"
            >
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-amber-800">
              Payment required
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {["bKash", "Nagad", "Card", "Net banking"].map((m) => (
                <span
                  key={m}
                  className="rounded-md border border-[#2a3d22] bg-[#162513] px-2 py-0.5 text-[10px] font-medium text-[#7a9c6e]"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2.5">
          <div className="mr-1 text-right">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-600">
              Due
            </p>
            <p className="text-lg font-semibold text-[#f0f7ec]">
              {formatAmount(booking.totalAmount)}
            </p>
          </div>

          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-[#162513] px-3.5 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
          >
            <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3">
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Cancel
          </button>

          <button
            onClick={onPay}
            disabled={isPayPending}
            className="flex items-center gap-1.5 rounded-xl bg-[#162513] px-4 py-2 text-xs font-semibold text-[#f0f7ec] transition hover:bg-[#1c2f17] active:scale-95 disabled:opacity-60"
          >
            {isPayPending ? (
              <>
                <svg
                  className="h-3 w-3 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="opacity-25"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Redirecting…
              </>
            ) : (
              <>
                Pay now
                <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3">
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Invoice Button ────────────────────────────────────────────────────────────

function InvoiceButton({ paymentId }: { paymentId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function handleClick() {
    setLoading(true);
    setError(false);
    try {
      await generateInvoicePDF(paymentId);
    } catch (e) {
      console.error("Invoice generation failed", e);
      setError(true);
      setTimeout(() => setError(false), 3000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      title="Download invoice PDF"
      className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-medium transition active:scale-95 disabled:opacity-60 ${
        error
          ? "border-red-200 bg-red-50 text-red-600"
          : "border-[#2a3d22] bg-[#162513] text-[#7a9c6e] hover:border-gray-300 hover:bg-[#1c2f17]"
      }`}
    >
      {loading ? (
        <>
          <svg
            className="h-3 w-3 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              className="opacity-25"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Generating…
        </>
      ) : error ? (
        <>
          <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3">
            <path
              d="M8 5v4M8 11h.01"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          Failed
        </>
      ) : (
        <>
          <svg
            viewBox="0 0 16 16"
            fill="none"
            className="h-3.5 w-3.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 2h10v12l-2-1.5-2 1.5-2-1.5L5 14 3 12.5V2z" />
            <path d="M6 5h4M6 8h4M6 11h2" />
          </svg>
          Invoice
        </>
      )}
    </button>
  );
}

// ─── Booking Card ──────────────────────────────────────────────────────────────

interface BookingCardProps {
  booking: Booking;
  onPay: () => void;
  onCancel: () => void;
  isPayPending: boolean;
}

function BookingCard({
  booking,
  onPay,
  onCancel,
  isPayPending,
}: BookingCardProps) {
  const s = getStatus(booking.status);
  const isUnpaid =
    booking.paymentStatus === PaymentStatus.UNPAID &&
    booking.status !== BookingStatus.CANCELLED;
  const isPaid = booking.paymentStatus === PaymentStatus.PAID;
  const isCancelled = booking.status === BookingStatus.CANCELLED;

  // ✅ FIX: payments is an array — grab the first entry's id
  const payments = (booking as any).payments as Array<{ id: string }> | undefined;
  const paymentId: string | undefined = payments?.[0]?.id;

  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-[#162513] shadow-sm transition hover:shadow-md ${
        isUnpaid ? "border-amber-200" : "border-[#2a3d22] hover:border-[#2a3d22]"
      }`}
    >
      <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        {/* Left */}
        <div className="flex items-start gap-3">
          <div className={`mt-[7px] h-2 w-2 shrink-0 rounded-full ${s.dot}`} />
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${s.pill}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                {s.label}
              </span>

              {isUnpaid && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700 ring-[0.5px] ring-amber-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  Unpaid
                </span>
              )}

              {isPaid && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 ring-[0.5px] ring-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Paid
                </span>
              )}
            </div>

            <p className="mt-1.5 font-mono text-[11px] text-[#2a3d22]">
              {booking.id}
            </p>

            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-[#4a6b40]">
           <span>Booked {booking.createdAt ? formatDate(booking.createdAt) : "—"}</span>
              {booking.confirmedAt && (
                <span>Confirmed {formatDate(booking.confirmedAt)}</span>
              )}
              {booking.cancelledAt && (
                <span className="text-red-400">
                  Cancelled {formatDate(booking.cancelledAt)}
                </span>
              )}
            </div>

            {booking.notes && (
              <p className="mt-1.5 text-[11px] italic text-[#2a3d22]">
                "{booking.notes}"
              </p>
            )}
            {booking.cancelReason && (
              <p className="mt-1 text-[11px] text-red-400">
                Reason: {booking.cancelReason}
              </p>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="flex shrink-0 flex-col items-end gap-2.5">
          {(isPaid || isCancelled) && (
            <div className="text-right">
              <p className="text-[10px] text-[#4a6b40]">Total</p>
              <p className="text-lg font-semibold text-[#f0f7ec]">
                {formatAmount(booking.totalAmount)}
              </p>
            </div>
          )}

          {/* ✅ FIX: uses payments[0].id */}
          {isPaid && paymentId && <InvoiceButton paymentId={paymentId} />}
        </div>
      </div>

      {isUnpaid && (
        <PaymentSection
          booking={booking}
          onPay={onPay}
          onCancel={onCancel}
          isPayPending={isPayPending}
        />
      )}
    </div>
  );
}

// ─── Filter Tabs ───────────────────────────────────────────────────────────────

type FilterKey = "ALL" | BookingStatus;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: BookingStatus.CONFIRMED, label: "Confirmed" },
  { key: BookingStatus.PENDING, label: "Pending" },
  { key: BookingStatus.COMPLETED, label: "Completed" },
  { key: BookingStatus.CANCELLED, label: "Cancelled" },
];

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function MemberBookingsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery<Booking[]>({
    queryKey: ["my-bookings"],
    queryFn: BookingService.getMyBookings,
    select: (res) => (Array.isArray(res) ? res : (res as any)?.data ?? []),
  });

  const bookings: Booking[] = data ?? [];

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      BookingService.cancel(id, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      setCancelTarget(null);
    },
  });

  async function handlePay(booking: Booking) {
    setPayingId(booking.id);
    try {
      const res = await PaymentService.createCheckoutSession(booking.id);
      if (res?.url) window.location.href = res.url;
    } catch (err) {
      console.error("Checkout failed", err);
    } finally {
      setPayingId(null);
    }
  }

  const confirmedCount = bookings.filter(
    (b) => b.status === BookingStatus.CONFIRMED,
  ).length;
  const pendingCount = bookings.filter(
    (b) => b.status === BookingStatus.PENDING,
  ).length;
  const completedCount = bookings.filter(
    (b) => b.status === BookingStatus.COMPLETED,
  ).length;
  const unpaidCount = bookings.filter(
    (b) =>
      b.paymentStatus === PaymentStatus.UNPAID &&
      b.status !== BookingStatus.CANCELLED,
  ).length;

  const filtered =
    filter === "ALL" ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <div className="min-h-screen bg-[#1c2f17]/60 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-4/5">
        {/* Header */}
        <div className="mb-7">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-[#4a6b40]">
            Member portal
          </p>
          <h1 className="text-2xl font-semibold text-[#f0f7ec]">My bookings</h1>
          {unpaidCount > 0 && (
            <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
              <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
                <circle
                  cx="8"
                  cy="8"
                  r="6.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <path
                  d="M8 5v3.5M8 11h.01"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
              {unpaidCount} booking{unpaidCount > 1 ? "s" : ""} awaiting
              payment
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Confirmed"
            value={confirmedCount}
            accent="text-emerald-600"
          />
          <StatCard
            label="Pending"
            value={pendingCount}
            accent="text-amber-500"
          />
          <StatCard
            label="Completed"
            value={completedCount}
            accent="text-blue-500"
          />
          <StatCard label="Unpaid" value={unpaidCount} accent="text-red-500" />
        </div>

        {/* Filter tabs */}
        <div className="mb-5 flex gap-1 overflow-x-auto rounded-2xl border border-[#2a3d22] bg-[#162513] p-1 shadow-sm">
          {FILTERS.map(({ key, label }) => {
            const count =
              key === "ALL"
                ? bookings.length
                : bookings.filter((b) => b.status === key).length;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-medium transition ${
                  filter === key
                    ? "bg-[#162513] text-[#f0f7ec]"
                    : "text-[#7a9c6e] hover:bg-[#1c2f17] hover:text-[#d0e8c8]"
                }`}
              >
                {label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                    filter === key
                      ? "bg-[#162513]/20 text-[#f0f7ec]"
                      : "bg-[#1c2f17] text-[#4a6b40]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Booking list */}
        <div className="flex flex-col gap-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
          ) : filtered.length === 0 ? (
            <EmptyState filter={filter} />
          ) : (
            filtered.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                isPayPending={payingId === booking.id}
                onPay={() => handlePay(booking)}
                onCancel={() => setCancelTarget(booking)}
              />
            ))
          )}
        </div>
      </div>

      {/* Cancel modal */}
      <CancelModal
        booking={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={(reason) => {
          if (cancelTarget)
            cancelMutation.mutate({ id: cancelTarget.id, reason });
        }}
        isPending={cancelMutation.isPending}
      />
    </div>
  );
}