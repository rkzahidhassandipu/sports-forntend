"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";
import BookingService from "@/services/booking.service";
import SessionService from "@/services/session.service";
import PaymentService from "@/services/payment.service";
import { toast } from "sonner"; // অথবা আপনার পছন্দের টোস্ট লাইব্রেরি

// Styles Constants
const brd = "#2a3d22";
const bg2 = "#162513";
const bgc = "#1c2f17";
const mut = "#7a9c6e";
const lime = "#9AD872";
const limeDark = "#0f1a0d";
const fg = "#f0f7ec";

const PAYMENT_METHODS = [
  { id: "card", label: "Debit / Credit Card (Stripe)", icon: "💳" },
  { id: "bkash", label: "bKash (Coming Soon)", icon: "📱", disabled: true },
  { id: "nagad", label: "Nagad (Coming Soon)", icon: "💚", disabled: true },
];

export default function BookingClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session");

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  // 1. Fetch Session Data
  const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["session", sessionId],
    queryFn: () => SessionService.getById(sessionId as string),
    enabled: !!sessionId,
  });

  const session = (response as any)?.data;

  // 2. Formatting Helpers
  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":");
    const h = parseInt(hours);
    const ampm = h >= 12 ? "PM" : "AM";
    const formattedHours = h % 12 || 12;
    return `${formattedHours}:${minutes} ${ampm}`;
  };

  const handleBookingSubmit = async () => {
    if (!sessionId) return;

    setLoading(true);
    try {
      // Step A: Create Booking in Database
      const bookingRes = await BookingService.create({
        sessionId: session.id,
        notes: bookingDetails.notes || "",
      });

      const bookingId = bookingRes.id;

      // Step B: If Card, redirect to Stripe
      if (paymentMethod === "card") {
        const checkout = await PaymentService.createCheckoutSession(bookingId);
        if (checkout?.url) {
          window.location.href = checkout.url;
        } else {
          throw new Error("Failed to get checkout URL");
        }
      } else {
        toast.error("Selected payment method is currently unavailable.");
      }
    } catch (error: any) {
      console.error("Booking Error:", error);
      toast.error(
        error?.response?.data?.message || "Booking failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center text-[#9AD872] animate-pulse font-display">
        LOADING SESSION...
      </div>
    );

  if (isError || !session)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Session not found.{" "}
        <Link href="/sessions" className="underline ml-2">
          Back to Explore
        </Link>
      </div>
    );

  const price =
    typeof session.price === "string"
      ? parseFloat(session.price)
      : session.price;
  const dbSlot = `${formatTime(session.startTime)} - ${formatTime(session.endTime)}`;
  const sessionDate = new Date(session.date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const STEPS = [
    { num: 1, label: "Time" },
    { num: 2, label: "Details" },
    { num: 3, label: "Payment" },
  ];

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div
        className="py-8 border-b"
        style={{ background: bg2, borderColor: brd }}
      >
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="font-display font-black text-4xl mb-1 uppercase tracking-tighter">
            BOOK <span style={{ color: lime }}>SESSION</span>
          </h1>
          <p
            className="text-xs font-bold uppercase italic"
            style={{ color: mut }}
          >
            {session.title} • {session.coach?.name}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Progress Indicator */}
        <div className="flex items-center gap-4 mb-10 max-w-xs">
          {STEPS.map((s, i) => (
            <div
              key={s.num}
              className="flex items-center flex-1 last:flex-none"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: step >= s.num ? lime : bgc,
                  color: step >= s.num ? limeDark : mut,
                  border: step < s.num ? `1px solid ${brd}` : "none",
                }}
              >
                {s.num}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className="h-px flex-1 mx-2"
                  style={{ background: step > s.num ? lime : brd }}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Step 1: Time Slot */}
            {step === 1 && (
              <div
                className="rounded-2xl p-6"
                style={{ background: bg2, border: `1px solid ${brd}` }}
              >
                <h2 className="font-display font-bold text-xl mb-6 italic uppercase">
                  SELECT SLOT
                </h2>
                <div className="space-y-4">
                  <div className="mb-6">
                    <label
                      className="text-[10px] font-bold uppercase tracking-widest mb-2 block"
                      style={{ color: mut }}
                    >
                      Scheduled Date
                    </label>
                    <div
                      className="w-full py-4 px-5 rounded-xl border font-black text-sm uppercase italic"
                      style={{ background: bgc, borderColor: brd, color: fg }}
                    >
                      📅 {sessionDate}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedSlot(dbSlot)}
                    className="w-full py-4 rounded-xl border font-black text-sm transition-all uppercase italic"
                    style={{
                      background: selectedSlot === dbSlot ? lime : bgc,
                      color: selectedSlot === dbSlot ? limeDark : fg,
                      borderColor: selectedSlot === dbSlot ? lime : brd,
                    }}
                  >
                    {dbSlot}
                  </button>
                </div>
                <button
                  onClick={() => setStep(2)}
                  disabled={!selectedSlot}
                  className="mt-8 w-full py-4 rounded-xl font-display font-black text-lg tracking-wide uppercase italic active:scale-95 disabled:opacity-30"
                  style={{ background: lime, color: limeDark }}
                >
                  NEXT STEP →
                </button>
              </div>
            )}

            {/* Step 2: User Details */}
            {step === 2 && (
              <div
                className="rounded-2xl p-6"
                style={{ background: bg2, border: `1px solid ${brd}` }}
              >
                <h2 className="font-display font-bold text-xl mb-6 italic uppercase">
                  YOUR INFO
                </h2>
                <div className="space-y-4">
                  {["name", "email", "phone"].map((key) => (
                    <div key={key}>
                      <label
                        className="text-[10px] font-bold uppercase mb-2 block"
                        style={{ color: mut }}
                      >
                        {key}
                      </label>
                      <input
                        className="w-full bg-brand-dark border rounded-xl px-4 py-3 text-sm outline-none"
                        style={{ background: bgc, borderColor: brd, color: fg }}
                        value={(bookingDetails as any)[key]}
                        onChange={(e) =>
                          setBookingDetails({
                            ...bookingDetails,
                            [key]: e.target.value,
                          })
                        }
                      />
                    </div>
                  ))}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 py-4 rounded-xl border font-bold text-xs uppercase"
                      style={{ borderColor: brd, color: mut }}
                    >
                      BACK
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      className="flex-1 py-4 rounded-xl font-display font-black text-lg uppercase italic"
                      style={{ background: lime, color: limeDark }}
                    >
                      CONTINUE
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Payment Choice */}
            {step === 3 && (
              <div
                className="rounded-2xl p-6"
                style={{ background: bg2, border: `1px solid ${brd}` }}
              >
                <h2 className="font-display font-bold text-xl mb-6 italic uppercase">
                  PAYMENT
                </h2>
                <div className="grid gap-2 mb-6">
                  {PAYMENT_METHODS.map((m) => (
                    <button
                      key={m.id}
                      disabled={m.disabled}
                      onClick={() => setPaymentMethod(m.id)}
                      className="flex items-center gap-3 p-4 rounded-xl border text-sm font-bold uppercase italic disabled:opacity-30"
                      style={{
                        background:
                          paymentMethod === m.id
                            ? "hsla(75,100%,55%,0.1)"
                            : bgc,
                        borderColor: paymentMethod === m.id ? lime : brd,
                        color: fg,
                      }}
                    >
                      <span>{m.icon}</span> {m.label}
                      {paymentMethod === m.id && (
                        <span className="ml-auto text-[#9AD872]">✓</span>
                      )}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleBookingSubmit}
                  disabled={loading}
                  className="w-full py-5 rounded-xl font-display font-black text-xl uppercase italic active:scale-95 disabled:opacity-50"
                  style={{ background: lime, color: limeDark }}
                >
                  {loading ? "PROCESSING..." : `PAY ${formatCurrency(price)}`}
                </button>
              </div>
            )}
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-1">
            <div
              className="rounded-2xl p-6 sticky top-24"
              style={{ background: bg2, border: `1px solid ${brd}` }}
            >
              <h3
                className="text-[10px] font-black uppercase tracking-widest mb-4"
                style={{ color: mut }}
              >
                SUMMARY
              </h3>
              <div
                className="flex gap-3 mb-6 pb-6 border-b"
                style={{ borderColor: brd }}
              >
                <img
                  src={session.coverImage}
                  className="w-12 h-12 rounded-lg object-cover"
                  alt=""
                />
                <div>
                  <div className="font-display font-bold text-sm leading-tight uppercase italic">
                    {session.title}
                  </div>
                  <div
                    className="text-[10px] font-bold mt-1"
                    style={{ color: mut }}
                  >
                    {session.category} • {session.level}
                  </div>
                </div>
              </div>
              <div className="space-y-3 text-[10px] font-bold uppercase">
                <div className="flex justify-between">
                  <span style={{ color: mut }}>Coach</span>
                  <span style={{ color: fg }}>{session.coach?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: mut }}>Duration</span>
                  <span style={{ color: fg }}>{session.duration} MINS</span>
                </div>
              </div>
              <div
                className="mt-6 pt-6 border-t flex justify-between items-end"
                style={{ borderColor: brd }}
              >
                <span
                  className="text-xs font-bold uppercase"
                  style={{ color: fg }}
                >
                  Total
                </span>
                <span
                  className="font-display text-2xl leading-none"
                  style={{ color: lime }}
                >
                  {formatCurrency(price)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
