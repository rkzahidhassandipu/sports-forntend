"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import FitnessService from "@/services/fitness.service";
import { cn } from "@/lib/utils";
import ActiveSessionTracker from "./ActiveSessionTracker";

interface Props {
  userRole: "TRAINER" | "COACH" | "ADMIN";
}

export default function StaffFitnessManager({ userRole }: Props) {
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);

  // ১. ট্রেইনারের ওভারঅল সামারি ডেটা ফেচ করা
  const { data: summary } = useQuery({
    queryKey: ["trainer-summary"],
    queryFn: () => FitnessService.getTrainerSummary(),
  });

  // ২. নির্দিষ্ট মেম্বারের রিপোর্ট (শুধুমাত্র COACH/ADMIN এর জন্য)
  const { data: report, isLoading: isReportLoading } = useQuery({
    queryKey: ["performance-report", selectedMemberId],
    queryFn: () => FitnessService.getPerformanceReport(selectedMemberId),
    enabled: !!selectedMemberId && (userRole === "COACH" || userRole === "ADMIN"),
  });

  // সেশন পপআপ ওপেন করার হ্যান্ডলার
  const handleOpenSession = () => {
    if (!selectedMemberId) {
      return alert("দয়া করে প্রথমে মেম্বার আইডি ইনপুট দিন।");
    }
    setIsSessionModalOpen(true);
  };

  return (
    <div className="relative space-y-8 p-6 lg:p-10 bg-slate-50 min-h-screen">
      
      {/* --- ACTIVE SESSION MODAL POPUP --- */}
      {isSessionModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
          {/* কালো ব্যাকড্রপ */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setIsSessionModalOpen(false)}
          />
          
          {/* মডাল কন্টেইনার */}
          <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-[#f8fafc] rounded-[3rem] shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
            {/* ক্লোজ বাটন */}
            <button 
              onClick={() => setIsSessionModalOpen(false)}
              className="absolute top-8 right-8 z-[110] w-12 h-12 bg-[#162513] rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-[#7a9c6e] hover:text-rose-500 transition-all"
            >
              ✕
            </button>

            <div className="p-8 md:p-12">
              {/* Tracker-এ মেম্বার আইডি এবং ক্লোজ ফাংশন পাঠানো হচ্ছে */}
              <ActiveSessionTracker 
                memberId={selectedMemberId} 
                onComplete={() => setIsSessionModalOpen(false)} 
              />
            </div>
          </div>
        </div>
      )}

      {/* ৩. হেডার সেকশন */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Staff <span className="text-lime-600">Portal</span>
          </h1>
          <p className="text-[#7a9c6e] text-sm font-medium italic">
            Role: <span className="font-mono text-lime-600 font-bold uppercase">{userRole}</span>
          </p>
        </div>
        <button 
          onClick={handleOpenSession}
          className="bg-slate-900 text-[#f0f7ec] px-8 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200"
        >
          + New Fitness Entry
        </button>
      </header>

      {/* ৪. স্ট্যাটস কার্ডস (Summary) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Active Members", val: summary?.activeMembers || 0, color: "text-slate-900" },
          { label: "Records This Month", val: summary?.monthlyRecords || 0, color: "text-slate-900" },
          { label: "Flagged Progress", val: summary?.flaggedCount || 0, color: "text-rose-500" }
        ].map((stat, i) => (
          <div key={i} className="bg-[#162513] p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <p className="text-[10px] font-black text-[#7a9c6e] uppercase tracking-[0.2em] mb-3">{stat.label}</p>
            <p className={cn("text-4xl font-black", stat.color)}>{stat.val}</p>
          </div>
        ))}
      </div>

      {/* ৫. মেম্বার সার্চ এবং ডিটেইলস সেকশন */}
      <section className="bg-[#162513] rounded-[3rem] p-10 border border-slate-100 shadow-sm">
        <div className="max-w-md mb-10">
          <label className="block text-[10px] font-black text-[#7a9c6e] uppercase tracking-widest mb-3">Search Member by ID</label>
          <input 
            type="text" 
            placeholder="e.g. MEM-10293"
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-4 focus:ring-lime-500/10 focus:border-[#9AD872] transition-all"
          />
        </div>

        {!selectedMemberId ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-[2.5rem]">
            <p className="text-[#7a9c6e] italic font-medium text-lg">
              Enter a Member ID above to track live sessions and view deep analytics.
            </p>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
              <div className="h-3 w-3 rounded-full bg-[#9AD872] animate-pulse" />
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Active Metrics for {selectedMemberId}</h3>
            </div>
            
            {/* অ্যাডভান্সড রিপোর্ট (শুধুমাত্র কোচ ও এডমিনের জন্য) */}
            {(userRole === "COACH" || userRole === "ADMIN") && (
              <div className="bg-slate-900 text-[#f0f7ec] p-10 rounded-[2.5rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <span className="text-8xl font-black tracking-tighter">DATA</span>
                </div>
                
                <h4 className="text-[#9AD872] font-black text-[10px] uppercase tracking-[0.3em] mb-8">Advanced Analytics Overview</h4>
                
                {isReportLoading ? (
                  <div className="flex items-center gap-4 text-[#7a9c6e]">
                    <div className="w-5 h-5 border-2 border-[#9AD872] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-bold uppercase tracking-widest">Processing Cloud Data...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {Object.entries(report?.metrics || {}).map(([key, val]: any) => (
                      <div key={key} className="relative group">
                        <div className="absolute -left-4 top-0 bottom-0 w-1 bg-[#9AD872]/30 group-hover:bg-[#9AD872] transition-colors" />
                        <p className="text-[#7a9c6e] text-[10px] font-black uppercase tracking-widest mb-1">{key}</p>
                        <p className="text-2xl font-black">{val[val.length - 1] || "N/A"}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <p className="text-xs text-[#7a9c6e] font-bold uppercase tracking-widest italic">
              Note: Every update you save is instantly synced to the member&apos;s personal dashboard.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}