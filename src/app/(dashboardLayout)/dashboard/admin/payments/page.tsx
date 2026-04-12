"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

export default function PaymentPage() {
  const [isProcessing, setIsProcessing] = useState(false);

  // আপনার ব্যাকএন্ড সার্ভিস থেকে আসা স্যাম্পল ডাটা
  const bookingDetails = {
    sessionTitle: "Elite Boxing Session",
    coach: "John Doe",
    date: "Saturday, April 11, 2026",
    time: "10:00 AM - 11:30 AM",
    amount: 45.00,
    fee: 2.50,
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    // এখানে আপনার 'createCheckout' API কল হবে
    // setTimeout দিয়ে জাস্ট লোডিং সিমুলেট করা হয়েছে
    setTimeout(() => setIsProcessing(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-12 text-slate-900">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Summary & Method */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Complete <span className="text-lime-600">Payment</span>
            </h1>
            <p className="text-slate-500 mt-2 font-medium">Review your session details and proceed to secure checkout.</p>
          </div>

          {/* Booking Summary Card */}
          <div className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
              <div className="w-14 h-14 bg-lime-50 rounded-2xl flex items-center justify-center text-2xl">🥊</div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">{bookingDetails.sessionTitle}</h3>
                <p className="text-sm text-slate-500">with {bookingDetails.coach}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</p>
                <p className="text-sm font-bold text-slate-700">{bookingDetails.date}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time</p>
                <p className="text-sm font-bold text-slate-700">{bookingDetails.time}</p>
              </div>
            </div>
          </div>

          {/* Payment Method Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 px-1">Payment Method</h4>
            <div className="p-4 rounded-2xl bg-white border-2 border-lime-500 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="px-3 py-1 bg-slate-900 text-white rounded-lg font-black text-xs tracking-tighter">STRIPE</div>
                <p className="text-sm font-bold text-slate-800 text-left">Credit or Debit Card</p>
              </div>
              <div className="w-5 h-5 rounded-full bg-lime-500 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-slate-900" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Total & Checkout */}
        <div className="lg:col-span-5">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl sticky top-8">
            <h3 className="text-xl font-bold mb-8">Order Summary</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-slate-400 text-sm">
                <span>Session Price</span>
                <span className="text-white font-bold">${bookingDetails.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-sm">
                <span>Service Fee</span>
                <span className="text-white font-bold">${bookingDetails.fee.toFixed(2)}</span>
              </div>
              <div className="pt-4 border-t border-slate-800 flex justify-between">
                <span className="font-bold text-lg">Total</span>
                <span className="font-black text-2xl text-lime-400">
                  ${(bookingDetails.amount + bookingDetails.fee).toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className={cn(
                "w-full py-4 rounded-2xl font-black text-slate-900 transition-all flex items-center justify-center gap-2",
                isProcessing ? "bg-slate-700 cursor-not-allowed" : "bg-lime-400 hover:bg-lime-300 active:scale-95"
              )}
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                "Pay with Stripe"
              )}
            </button>

            <p className="text-[10px] text-center text-slate-500 mt-6 leading-relaxed">
              Your payment is secured with industry-standard encryption. By proceeding, you agree to our Terms of Service.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}