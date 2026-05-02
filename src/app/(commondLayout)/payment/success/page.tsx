"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  Loader2,
} from "lucide-react";

// Design constants
const brd = "#2a3d22";
const bg2 = "#162513";
const lime = "#9AD872";
const limeDark = "#0f1a0d";
const mut = "#7a9c6e";

// 1. Main Content Component
function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setStatus("error");
        return;
      }
      try {
        // Simulate API verification
        setTimeout(() => {
          setStatus("success");
        }, 2000);
      } catch {
        setStatus("error");
      }
    };

    verifyPayment();
  }, [sessionId]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-dark">
        <Loader2 className="w-10 h-10 text-[#9AD872] animate-spin mb-4" />
        <p
          className="font-display font-bold tracking-widest text-sm uppercase"
          style={{ color: mut }}
        >
          Verifying Payment...
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-red-500 text-6xl mb-4">✕</div>
        <h1 className="text-2xl font-black uppercase italic mb-2">
          Payment Verification Failed
        </h1>
        <p style={{ color: mut }} className="mb-8 text-center max-w-sm">
          We couldn't verify your transaction. Please contact support if your
          balance was deducted.
        </p>
        <Link
          href="/dashboard"
          className="px-8 py-3 rounded-xl font-bold border"
          style={{ borderColor: brd }}
        >
          BACK TO DASHBOARD
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="relative inline-block mb-8">
          <div className="w-24 h-24 rounded-full bg-[#9AD872]/10 border border-[#9AD872]/20 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-[#9AD872]" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#9AD872] rounded-full flex items-center justify-center text-black font-bold animate-bounce">
            !
          </div>
        </div>

        <h1 className="font-display font-black text-5xl mb-2 italic uppercase tracking-tighter">
          PAYMENT <span style={{ color: lime }}>SUCCESS!</span>
        </h1>
        <p
          style={{ color: mut }}
          className="text-sm font-bold uppercase tracking-wider mb-10"
        >
          Your booking has been confirmed
        </p>

        {/* Transaction Summary Card */}
        <div
          className="rounded-3xl p-6 mb-10 text-left overflow-hidden relative"
          style={{ background: bg2, border: `1px solid ${brd}` }}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <CheckCircle2 size={100} />
          </div>

          <h3 className="text-[10px] font-black text-[#9AD872] uppercase tracking-[0.2em] mb-4">
            Booking Details
          </h3>

          <div className="space-y-4 relative z-10">
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 mt-1" style={{ color: mut }} />
              <div>
                <p
                  className="text-[10px] font-bold uppercase"
                  style={{ color: mut }}
                >
                  Session Date
                </p>
                <p className="text-sm font-bold">April 28, 2026</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 mt-1" style={{ color: mut }} />
              <div>
                <p
                  className="text-[10px] font-bold uppercase"
                  style={{ color: mut }}
                >
                  Time Slot
                </p>
                <p className="text-sm font-bold">10:00 AM - 11:30 AM</p>
              </div>
            </div>

            <div
              className="pt-4 border-t"
              style={{ borderColor: brd }}
            >
              <div className="flex justify-between items-center">
                <span
                  className="text-[10px] font-bold uppercase"
                  style={{ color: mut }}
                >
                  Session ID
                </span>
                <span className="text-[10px] font-mono opacity-50 uppercase">
                  {sessionId ? `${sessionId.slice(0, 15)}...` : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid gap-3">
          <Link
            href="/dashboard/bookings"
            className="group flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-display font-black text-sm tracking-widest transition-all hover:gap-4"
            style={{ background: lime, color: limeDark }}
          >
            VIEW MY BOOKINGS <ArrowRight size={16} />
          </Link>

          <Link
            href="/"
            className="w-full py-4 rounded-2xl font-display font-bold text-xs tracking-widest border transition-colors hover:bg-[#162513]/5"
            style={{ borderColor: brd, color: mut }}
          >
            RETURN HOME
          </Link>
        </div>
      </div>
    </div>
  );
}

// 2. Main Page Component (Export Default)
export default function PaymentSuccess() {
  return (
    // Suspense boundary build error fixed kore
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-brand-dark">
          <Loader2 className="w-10 h-10 text-[#9AD872] animate-spin mb-4" />
          <p className="text-[#7a9c6e] font-bold uppercase text-sm">
            Loading Payment Info...
          </p>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}