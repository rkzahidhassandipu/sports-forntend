"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("PROFILE");

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10 text-slate-900">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Sidebar: Navigation */}
        <div className="lg:col-span-3 space-y-2">
          <h2 className="text-xl font-black mb-6 px-4">Settings</h2>
          {[
            { id: "PROFILE", label: "Profile Info", icon: "👤" },
            { id: "SECURITY", label: "Security", icon: "🔒" },
            { id: "NOTIFICATIONS", label: "Notifications", icon: "🔔" },
            { id: "SYSTEM", label: "System Config", icon: "⚙️" }, // Admin only context
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                activeSection === item.id 
                  ? "bg-slate-900 text-[#f0f7ec] shadow-lg shadow-slate-200" 
                  : "text-[#7a9c6e] hover:bg-[#162513] hover:text-[#7a9c6e]"
              )}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-9 bg-[#162513] rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
          
          {activeSection === "PROFILE" && (
            <div className="p-8 lg:p-12 space-y-10">
              <div className="flex flex-col md:flex-row items-center gap-8 pb-10 border-b border-slate-50">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-[2rem] bg-[#9AD872] flex items-center justify-center text-3xl font-black shadow-xl shadow-lime-100">
                    RU
                  </div>
                  <button className="absolute -bottom-2 -right-2 p-2 bg-slate-900 text-[#f0f7ec] rounded-xl border-4 border-white hover:scale-110 transition-transform">
                    📷
                  </button>
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-xl font-bold">Raihan Uddin</h3>
                  <p className="text-sm text-[#7a9c6e] font-medium">Full Stack Web Developer • Dhaka, BD</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#7a9c6e] uppercase tracking-widest ml-1">Display Name</label>
                  <input type="text" defaultValue="Raihan Uddin" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:border-[#9AD872] outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#7a9c6e] uppercase tracking-widest ml-1">Email</label>
                  <input type="email" defaultValue="raihan@dev.com" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:border-[#9AD872] outline-none transition-all" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-[#7a9c6e] uppercase tracking-widest ml-1">Short Bio</label>
                  <textarea rows={3} defaultValue="Passionate full-stack developer focused on modern web tech." className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:border-[#9AD872] outline-none transition-all resize-none" />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button className="px-10 py-4 bg-[#9AD872] hover:bg-lime-300 text-slate-900 font-black rounded-2xl transition-all active:scale-95 shadow-lg shadow-lime-100">
                  Update Profile
                </button>
              </div>
            </div>
          )}

          {activeSection === "SECURITY" && (
            <div className="p-8 lg:p-12 space-y-8">
              <h3 className="text-lg font-bold">Security & Authentication</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-sm font-bold">Two-Factor Authentication</p>
                    <p className="text-[10px] text-[#7a9c6e] font-medium">Add an extra layer of security to your account.</p>
                  </div>
                  <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-pointer">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-[#162513] rounded-full transition-all" />
                  </div>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                   <p className="text-sm font-bold">Password Last Changed</p>
                   <p className="text-xs font-bold text-[#7a9c6e] tracking-tight">March 15, 2026</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === "SYSTEM" && (
            <div className="p-8 lg:p-12 space-y-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2 py-1 bg-rose-50 text-rose-600 text-[10px] font-black rounded-md border border-rose-100">ADMIN ONLY</span>
                <h3 className="text-lg font-bold">Maintenance Mode</h3>
              </div>
              <div className="p-8 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-center space-y-4">
                 <p className="text-sm text-[#7a9c6e] max-w-sm">Activating maintenance mode will restrict access to the public site for everyone except Admins.</p>
                 <button className="px-8 py-3 bg-rose-500 text-[#f0f7ec] font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-rose-600 transition-all">
                    Enable Maintenance
                 </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}