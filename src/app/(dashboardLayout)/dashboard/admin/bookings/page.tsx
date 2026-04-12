"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

// ১. বুকিং স্ট্যাটাস টাইপ এবং কালার ম্যাপিং
const STATUS_STYLES = {
  PENDING: "bg-amber-50 text-amber-600 border-amber-200",
  CONFIRMED: "bg-emerald-50 text-emerald-600 border-emerald-200",
  CANCELLED: "bg-rose-50 text-rose-600 border-rose-200",
  COMPLETED: "bg-slate-50 text-slate-600 border-slate-200",
};

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="p-6 lg:p-10 space-y-8 bg-[#f8fafc] min-h-screen text-slate-900">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            My <span className="text-lime-600">Bookings</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Manage your session schedules and payments.</p>
        </div>
        <button className="px-6 py-3 bg-slate-900 text-white hover:bg-black rounded-2xl text-sm font-bold transition-all shadow-xl shadow-slate-200 flex items-center gap-2">
          <span>+</span> Book New Session
        </button>
      </header>

      {/* 2. Filters & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-2 rounded-2xl border border-slate-200/60 shadow-sm">
        <div className="flex gap-1">
          {["all", "PENDING", "CONFIRMED", "CANCELLED"].map((status) => (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider",
                activeTab === status 
                  ? "bg-slate-900 text-white" 
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              )}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="relative px-2">
          <input 
            type="text" 
            placeholder="Search by session..." 
            className="pl-4 pr-10 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:border-lime-500 transition-colors w-64"
          />
        </div>
      </div>

      {/* 3. Bookings List (Aligned with Prisma Service) */}
      <div className="grid grid-cols-1 gap-4">
        {[1, 2, 3].map((_, i) => (
          <div key={i} className="group bg-white border border-slate-200/60 rounded-3xl p-6 hover:shadow-md transition-all">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              
              {/* Session Info */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <span className={cn("px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-tighter", STATUS_STYLES.CONFIRMED)}>
                    Confirmed
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">#BK-9021{i}</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 group-hover:text-lime-600 transition-colors">Elite Boxing Session</h3>
                <div className="flex items-center gap-4 text-slate-500 text-xs font-medium">
                  <span className="flex items-center gap-1.5">📅 Saturday, April 11</span>
                  <span className="flex items-center gap-1.5">⏰ 10:00 AM - 11:30 AM</span>
                  <span className="flex items-center gap-1.5 font-bold text-slate-900">💰 $45.00</span>
                </div>
              </div>

              {/* Coach Avatar (from your BOOKING_INCLUDE) */}
              <div className="flex items-center gap-3 px-4 border-l border-slate-100 hidden lg:flex">
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-400">
                  JD
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none mb-1">Coach</p>
                  <p className="text-sm font-bold text-slate-900">John Doe</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
                  Details
                </button>
                {/* if paymentStatus === "PENDING", show Checkout */}
                <button className="px-5 py-2.5 rounded-xl bg-lime-500 text-slate-950 text-xs font-bold hover:bg-lime-400 transition-all shadow-lg shadow-lime-500/20">
                  Pay Now
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}