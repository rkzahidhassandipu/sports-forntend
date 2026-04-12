"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { SESSIONS } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import BookingService from "@/services/booking.service";

const TIME_SLOTS = ["7:00 AM","8:00 AM","9:00 AM","5:00 PM","6:00 PM","7:00 PM"];
const PAYMENT_METHODS = [
  { id:"bkash", label:"bKash", icon:"📱" },
  { id:"nagad", label:"Nagad", icon:"💚" },
  { id:"rocket", label:"Rocket", icon:"🚀" },
  { id:"card", label:"Debit / Credit Card", icon:"💳" },
  { id:"bank", label:"Bank Transfer", icon:"🏦" },
];

const brd = "hsl(220 18% 18%)";
const bg2 = "hsl(220 22% 10%)";
const bgc = "hsl(220 20% 13%)";
const mut = "hsl(220 12% 60%)";
const lime = "hsl(75 100% 55%)";
const limeDark = "hsl(220 25% 6%)";
const fg = "hsl(210 20% 95%)";

export default function BookingClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session") || "1";
  const session = SESSIONS.find(s => s.id === sessionId) || SESSIONS[0];
  const [step, setStep] = useState<1|2|3>(1);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bkash");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [bookingDetails, setBookingDetails] = useState({ name: "", email: "", phone: "", notes: "" });

  const handleBookingSubmit = async () => {
    if (!selectedSlot) {
      setApiError("Please select a preferred time slot before continuing.");
      return;
    }

    setLoading(true);
    setApiError(null);

    try {
      const booking = await BookingService.create({
        sessionId: session.id,
        notes: bookingDetails.notes || "",
      });

      const checkout = await BookingService.createCheckout(booking.id);
      if (checkout?.url) {
        window.location.href = checkout.url;
        return;
      }

      setConfirmed(true);
    } catch (error) {
      setApiError("Could not complete the booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const spotsLeft = session.maxMembers - session.enrolledCount;
  const STEPS = [{num:1,label:"Select Time"},{num:2,label:"Your Details"},{num:3,label:"Payment"}];

  if (confirmed) {
    return (
      <div className="min-h-screen pt-20 pb-16 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-6" style={{ background:"hsla(174,85%,50%,0.15)", border:"1px solid hsla(174,85%,50%,0.3)" }}>✓</div>
          <h2 className="font-display font-black text-4xl mb-3" style={{ color:"hsl(174 85% 50%)" }}>BOOKING CONFIRMED!</h2>
          <p className="text-sm mb-2" style={{ color: mut }}>Your session has been booked successfully.</p>
          <p className="text-sm mb-8" style={{ color: mut }}>Confirmation sent to your email and phone.</p>
          <div className="rounded-xl p-5 mb-6 text-left" style={{ background: bg2, border:`1px solid ${brd}` }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{session.icon}</span>
              <div>
                <div className="font-display font-bold text-lg">{session.title}</div>
                <div className="text-sm" style={{ color: mut }}>{selectedSlot} · {session.venue}</div>
              </div>
            </div>
            <div className="flex justify-between text-sm pt-4" style={{ borderTop:`1px solid ${brd}` }}>
              <span style={{ color: mut }}>Total Paid</span>
              <span className="font-bold" style={{ color: lime }}>{formatCurrency(session.price)}</span>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <Link href="/dashboard" className="font-display font-bold px-6 py-3 rounded-xl text-sm tracking-wide transition-all" style={{ background: lime, color: limeDark }}>GO TO DASHBOARD</Link>
            <Link href="/sessions" className="px-6 py-3 rounded-xl text-sm transition-all" style={{ border:`1px solid ${brd}`, color: mut }}>Browse More</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="py-8 border-b" style={{ background: bg2, borderColor: brd }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-xs mb-3" style={{ color: mut }}>
            <Link href="/" className="hover:opacity-80 transition-opacity" style={{ color: lime }}>Home</Link>{" › "}
            <Link href="/sessions" className="hover:opacity-80 transition-opacity" style={{ color: mut }}>Sessions</Link>{" › "}
            <span>Book Session</span>
          </div>
          <h1 className="font-display font-black text-4xl mb-1">BOOK <span style={{ color: lime }}>SESSION</span></h1>
          <p className="text-sm" style={{ color: mut }}>{session.title} · {session.coach}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Steps */}
        <div className="flex items-center gap-0 mb-10 max-w-sm">
          {STEPS.map((s,i) => (
            <div key={s.num} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300" style={{
                  background: step > s.num ? "hsl(174 85% 50%)" : step === s.num ? lime : bgc,
                  color: step > s.num || step === s.num ? limeDark : mut,
                  border: step <= s.num ? `1px solid ${brd}` : "none",
                }}>
                  {step > s.num ? "✓" : s.num}
                </div>
                <span className="text-[10px] mt-1 whitespace-nowrap" style={{ color: mut }}>{s.label}</span>
              </div>
              {i < STEPS.length-1 && <div className="h-px flex-1 mx-2 mb-4 transition-all duration-300" style={{ background: step > s.num ? "hsl(174 85% 50%)" : brd }} />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Step 1 */}
            {step === 1 && (
              <div className="rounded-xl p-6" style={{ background: bg2, border:`1px solid ${brd}` }}>
                <h2 className="font-display font-bold text-2xl mb-6">SELECT DATE & TIME</h2>
                <div className="mb-6">
                  <label className="block text-xs font-bold tracking-wider uppercase mb-3" style={{ color: mut }}>Start Date</label>
                  <input type="date" min={new Date().toISOString().split("T")[0]} defaultValue={new Date(Date.now()+7*86400000).toISOString().split("T")[0]} className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all" style={{ background: bgc, border:`1px solid ${brd}`, color: fg }} />
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-wider uppercase mb-3" style={{ color: mut }}>Preferred Time Slot</label>
                  <div className="grid grid-cols-3 gap-2">
                    {TIME_SLOTS.map(slot => (
                      <button key={slot} onClick={() => setSelectedSlot(slot)} className="py-3 rounded-xl text-sm font-medium transition-all duration-200" style={{
                        background: selectedSlot===slot ? lime : bgc,
                        color: selectedSlot===slot ? limeDark : mut,
                        border: selectedSlot===slot ? `1px solid ${lime}` : `1px solid ${brd}`,
                        fontWeight: selectedSlot===slot ? "700" : "500",
                      }}>
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={() => selectedSlot && setStep(2)} disabled={!selectedSlot} className="mt-6 w-full font-display font-bold py-4 rounded-xl tracking-wide transition-all duration-200 active:scale-95 disabled:opacity-40" style={{ background: lime, color: limeDark }}>
                  CONTINUE →
                </button>
              </div>
            )}

            {/* Step 2 - TanStack Form */}
            {step === 2 && (
              <div className="rounded-xl p-6" style={{ background: bg2, border:`1px solid ${brd}` }}>
                <h2 className="font-display font-bold text-2xl mb-6">YOUR DETAILS</h2>
                <form onSubmit={e => { e.preventDefault(); setStep(3); }} className="flex flex-col gap-4">
                  {([
                    { key: "name", label: "Full Name", type: "text", placeholder: "Your full name" },
                    { key: "email", label: "Email Address", type: "email", placeholder: "your@email.com" },
                    { key: "phone", label: "Phone Number", type: "tel", placeholder: "+880 1XXX-XXXXXX" },
                  ] as const).map((field) => (
                    <div key={field.key}>
                      <label className="block text-xs font-bold tracking-wider uppercase mb-2" style={{ color: mut }}>{field.label}</label>
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={bookingDetails[field.key]}
                        onChange={(event) => setBookingDetails((prev) => ({ ...prev, [field.key]: event.target.value }))}
                        required
                        className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                        style={{ background: bgc, border: `1px solid ${brd}`, color: fg }}
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-bold tracking-wider uppercase mb-2" style={{ color: mut }}>Special Notes (Optional)</label>
                    <textarea
                      placeholder="Any health conditions, equipment needs..."
                      value={bookingDetails.notes}
                      onChange={(event) => setBookingDetails((prev) => ({ ...prev, notes: event.target.value }))}
                      rows={3}
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none transition-all"
                      style={{ background: bgc, border: `1px solid ${brd}`, color: fg }}
                    />
                  </div>
                  <div className="flex gap-3 mt-2">
                    <button type="button" onClick={() => setStep(1)} className="flex-1 font-display font-bold py-4 rounded-xl tracking-wide transition-all" style={{ border: `1px solid ${brd}`, color: mut }}>← BACK</button>
                    <button type="submit" className="flex-1 font-display font-bold py-4 rounded-xl tracking-wide transition-all active:scale-95" style={{ background: lime, color: limeDark }}>CONTINUE →</button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="rounded-xl p-6" style={{ background: bg2, border:`1px solid ${brd}` }}>
                <h2 className="font-display font-bold text-2xl mb-6">PAYMENT METHOD</h2>
                <div className="flex flex-col gap-2 mb-6">
                  {PAYMENT_METHODS.map(method => (
                    <button key={method.id} onClick={() => setPaymentMethod(method.id)} className="flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200" style={{
                      border: paymentMethod===method.id ? `1px solid hsla(75,100%,55%,0.5)` : `1px solid ${brd}`,
                      background: paymentMethod===method.id ? "hsla(75,100%,55%,0.08)" : bgc,
                    }}>
                      <span className="text-2xl">{method.icon}</span>
                      <span className="font-medium text-sm" style={{ color: fg }}>{method.label}</span>
                      {paymentMethod===method.id && <span className="ml-auto font-bold text-sm" style={{ color: lime }}>✓</span>}
                    </button>
                  ))}
                </div>
                <div className="rounded-xl p-4 mb-6" style={{ background: bgc, border:`1px solid ${brd}` }}>
                  <div className="flex justify-between text-sm mb-2"><span style={{ color: mut }}>Session fee</span><span style={{ color: fg }}>{formatCurrency(session.price)}</span></div>
                  <div className="flex justify-between text-sm mb-2"><span style={{ color: mut }}>Platform fee</span><span style={{ color:"hsl(174 85% 50%)" }}>Free</span></div>
                  <div className="flex justify-between font-bold pt-2 mt-2" style={{ borderTop:`1px solid ${brd}` }}>
                    <span style={{ color: fg }}>Total</span>
                    <span className="font-display text-lg" style={{ color: lime }}>{formatCurrency(session.price)}</span>
                  </div>
                </div>
                {apiError ? (
                  <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{apiError}</div>
                ) : null}
                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="flex-1 font-display font-bold py-4 rounded-xl tracking-wide transition-all" style={{ border: `1px solid ${brd}`, color: mut }}>← BACK</button>
                  <button onClick={handleBookingSubmit} disabled={loading} className="flex-1 font-display font-bold py-4 rounded-xl tracking-wide transition-all active:scale-95 disabled:opacity-60" style={{ background: lime, color: limeDark }}>
                    {loading ? "PROCESSING..." : `PAY ${formatCurrency(session.price)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order summary */}
          <div>
            <div className="rounded-xl p-5 sticky top-24" style={{ background: bg2, border:`1px solid ${brd}` }}>
              <h3 className="font-display font-bold text-base mb-4 tracking-wider uppercase" style={{ color: mut }}>Order Summary</h3>
              <div className="flex items-center gap-3 mb-5 pb-5" style={{ borderBottom:`1px solid ${brd}` }}>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: bgc, border:`1px solid ${brd}` }}>{session.icon}</div>
                <div>
                  <div className="font-display font-bold text-sm leading-tight">{session.title}</div>
                  <div className="text-xs mt-0.5" style={{ color: mut }}>{session.duration} · {session.level}</div>
                </div>
              </div>
              <div className="flex flex-col gap-2.5 text-sm mb-5">
                {[{k:"Coach",v:session.coach},{k:"Time",v:selectedSlot||"—"},{k:"Venue",v:session.venue}].map(r => (
                  <div key={r.k} className="flex justify-between">
                    <span style={{ color: mut }}>{r.k}</span>
                    <span className="font-medium text-right max-w-[120px] text-xs leading-tight" style={{ color: fg }}>{r.v}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold pt-4" style={{ borderTop:`1px solid ${brd}` }}>
                <span style={{ color: fg }}>Total</span>
                <span className="font-display text-xl" style={{ color: lime }}>{formatCurrency(session.price)}</span>
              </div>
              <p className="text-xs text-center mt-4 leading-relaxed" style={{ color: mut }}>Free cancellation up to 48 hours before session</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
