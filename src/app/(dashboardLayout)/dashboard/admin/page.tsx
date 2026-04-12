"use client";
import React from "react";
import { cn } from "@/lib/utils";

const STATS = [
  { label: "Total Revenue", value: "$12,840", trend: "+12.5%", icon: "💰", color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Active Bookings", value: "142", trend: "+4.2%", icon: "📅", color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Total Members", value: "856", trend: "+18.3%", icon: "👥", color: "text-purple-600", bg: "bg-purple-50" },
  { label: "Session Capacity", value: "88%", trend: "-2.1%", icon: "🔥", color: "text-orange-600", bg: "bg-orange-50" },
];

export default function WhiteOverviewPage() {
  return (
    <div className="p-6 lg:p-10 space-y-8 bg-[#f8fafc] min-h-screen text-slate-900">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            System <span className="text-lime-600">Overview</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Monitoring real-time performance and user activity.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-700 transition-all shadow-sm">
            Export CSV
          </button>
          <button className="px-5 py-2.5 bg-slate-900 text-white hover:bg-black rounded-xl text-sm font-bold transition-all shadow-lg shadow-slate-200">
            Create Session
          </button>
        </div>
      </header>

      {/* 1. Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat, i) => (
          <div key={i} className="p-6 rounded-3xl bg-white border border-slate-200/60 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-5">
              <span className={cn("p-2.5 rounded-xl text-xl", stat.bg, stat.color)}>{stat.icon}</span>
              <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full", 
                stat.trend.startsWith('+') ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600")}>
                {stat.trend}
              </span>
            </div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.15em]">{stat.label}</p>
            <h2 className="text-2xl font-black mt-1 text-slate-900">{stat.value}</h2>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. Main Chart Area */}
        <div className="lg:col-span-2 p-8 rounded-3xl bg-white border border-slate-200/60 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="font-bold text-lg text-slate-900">Revenue Stream</h3>
              <p className="text-xs text-slate-400 font-medium">Monthly growth comparison</p>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button className="px-3 py-1 text-[10px] font-bold bg-white shadow-sm rounded-md">Weekly</button>
              <button className="px-3 py-1 text-[10px] font-bold text-slate-500">Monthly</button>
            </div>
          </div>
          
          <div className="h-[300px] flex items-end gap-4 px-2">
            {[50, 80, 60, 95, 70, 85, 55].map((h, i) => (
              <div key={i} className="flex-1 bg-slate-50 rounded-t-2xl relative group transition-all h-full">
                <div 
                  style={{ height: `${h}%` }} 
                  className="absolute bottom-0 w-full bg-lime-400 rounded-t-2xl group-hover:bg-lime-500 transition-colors shadow-[0_-4px_12px_rgba(163,230,53,0.15)]"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-6 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>

        {/* 3. Status/Activity Table */}
        <div className="p-8 rounded-3xl bg-white border border-slate-200/60 shadow-sm">
          <h3 className="font-bold text-lg text-slate-900 mb-6">Recent Activity</h3>
          <div className="space-y-5">
            {[
              { name: "Sarah Connor", action: "Boxing", time: "2m ago", img: "SC" },
              { name: "Mike Ross", action: "Yoga", time: "15m ago", img: "MR" },
              { name: "Harvey S.", action: "Weights", time: "1h ago", img: "HS" },
              { name: "Rachel Z.", action: "Cardio", time: "3h ago", img: "RZ" },
            ].map((user, i) => (
              <div key={i} className="flex items-center gap-4 group cursor-pointer">
                <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xs font-bold transition-transform group-hover:scale-105">
                  {user.img}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                  <p className="text-[11px] text-slate-400 font-medium">{user.action} • {user.time}</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-lime-500 shadow-[0_0_8px_rgba(132,204,22,0.5)]" />
              </div>
            ))}
          </div>
          <button className="w-full mt-10 py-3.5 rounded-2xl border border-slate-100 bg-slate-50 text-[11px] font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all uppercase tracking-widest">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
}