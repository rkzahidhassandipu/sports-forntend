"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

const ROLE_BADGES = {
  ADMIN: "bg-purple-50 text-purple-600 border-purple-100",
  COACH: "bg-blue-50 text-blue-600 border-blue-100",
  TRAINER: "bg-orange-50 text-orange-600 border-orange-100",
  MEMBER: "bg-slate-100 text-[#7a9c6e] border-slate-200",
};

export default function UserPage() {
  const [view, setView] = useState("PROFILE"); // বা "ADMIN_LIST"

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10 text-slate-900">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header with View Toggle (Admin Only context) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight">
              Account <span className="text-lime-600">Settings</span>
            </h1>
            <p className="text-[#7a9c6e] text-sm mt-1 font-medium">Manage your personal identity and platform permissions.</p>
          </div>
          
          <div className="flex bg-[#162513] p-1.5 rounded-2xl border border-slate-200 shadow-sm self-start">
            <button 
              onClick={() => setView("PROFILE")}
              className={cn("px-6 py-2.5 rounded-xl text-xs font-black tracking-widest transition-all", 
              view === "PROFILE" ? "bg-slate-900 text-[#f0f7ec]" : "text-[#7a9c6e] hover:text-[#7a9c6e]")}
            >
              MY PROFILE
            </button>
            <button 
              onClick={() => setView("ADMIN_LIST")}
              className={cn("px-6 py-2.5 rounded-xl text-xs font-black tracking-widest transition-all", 
              view === "ADMIN_LIST" ? "bg-slate-900 text-[#f0f7ec]" : "text-[#7a9c6e] hover:text-[#7a9c6e]")}
            >
              USER DIRECTORY
            </button>
          </div>
        </div>

        {view === "PROFILE" ? (
          /* --- Section: Personal Profile (updateProfileDetails route) --- */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-[#162513] p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm text-center space-y-4">
                <div className="relative inline-block group">
                  <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-lime-400 to-lime-600 mx-auto flex items-center justify-center text-4xl font-black text-[#0f1a0d] shadow-xl shadow-lime-200/50">
                    RU
                  </div>
                  <button className="absolute -bottom-2 -right-2 p-3 bg-slate-900 text-[#f0f7ec] rounded-2xl border-4 border-white hover:scale-110 transition-transform">
                    📷
                  </button>
                </div>
                <div>
                  <h3 className="text-xl font-bold">Raihan Uddin</h3>
                  <p className="text-xs font-black text-lime-600 uppercase tracking-widest">Full Stack Developer</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-[#162513] p-8 lg:p-10 rounded-[2.5rem] border border-slate-200/60 shadow-sm space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#7a9c6e] uppercase tracking-widest ml-1">Full Name</label>
                  <input type="text" defaultValue="Raihan Uddin" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:border-[#9AD872] outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#7a9c6e] uppercase tracking-widest ml-1">Email Address</label>
                  <input type="email" defaultValue="raihan@example.com" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:border-[#9AD872] outline-none transition-all" />
                </div>
              </div>
              <button className="w-full md:w-auto px-10 py-4 bg-[#9AD872] hover:bg-lime-300 text-slate-900 font-black rounded-2xl transition-all active:scale-95">
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          /* --- Section: Admin User List (getAllUsers route) --- */
          <div className="bg-[#162513] rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-black text-[#7a9c6e] uppercase tracking-widest">User</th>
                  <th className="px-8 py-5 text-[10px] font-black text-[#7a9c6e] uppercase tracking-widest">Role</th>
                  <th className="px-8 py-5 text-[10px] font-black text-[#7a9c6e] uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-[#7a9c6e] uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[1, 2, 3].map((u) => (
                  <tr key={u} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-[#7a9c6e] text-xs">JD</div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">John Doe</p>
                          <p className="text-[10px] text-[#7a9c6e]">john@fitness.com</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={cn("px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-tighter", ROLE_BADGES.COACH)}>
                        COACH
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-xs font-bold text-[#7a9c6e]">Active</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="p-2.5 text-[#7a9c6e] hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
                        ⚙️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}