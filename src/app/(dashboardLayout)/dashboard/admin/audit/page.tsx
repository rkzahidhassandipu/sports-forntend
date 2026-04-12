"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

const METHOD_COLORS = {
  POST: "text-emerald-600 bg-emerald-50 border-emerald-100",
  PATCH: "text-amber-600 bg-amber-50 border-amber-100",
  DELETE: "text-rose-600 bg-rose-50 border-rose-100",
  GET: "text-blue-600 bg-blue-50 border-blue-100",
};

export default function AuditPage() {
  const [activeFilter, setActiveFilter] = useState("ALL");

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10 text-slate-900">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header (isAdmin context) */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              System <span className="text-lime-600">Audits</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium italic">Monitor administrative actions and security-sensitive events.</p>
          </div>
          <div className="flex items-center gap-3">
             <button className="px-5 py-2.5 bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all">
                Export CSV
             </button>
          </div>
        </header>

        {/* Filters & Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Logs (24h)</p>
              <p className="text-2xl font-black text-slate-900">1,284</p>
           </div>
           <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Critical Actions</p>
              <p className="text-2xl font-black text-rose-500">42</p>
           </div>
           <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Admins</p>
              <p className="text-2xl font-black text-lime-600">3</p>
           </div>
        </div>

        {/* Audit Table (getAllAudits route) */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
             <h3 className="font-bold text-lg">Activity Stream</h3>
             <div className="flex gap-2">
                {["ALL", "CRITICAL", "AUTH"].map(f => (
                  <button 
                    key={f} 
                    onClick={() => setActiveFilter(f)}
                    className={cn("px-4 py-2 text-[10px] font-black rounded-lg transition-all", 
                    activeFilter === f ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-400")}
                  >
                    {f}
                  </button>
                ))}
             </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin / User</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Endpoint</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[
                  { time: "10:42:15 AM", user: "Admin (Raihan)", action: "DELETE_SESSION", method: "DELETE", path: "/sessions/65a2...", status: "CRITICAL" },
                  { time: "09:15:02 AM", user: "Staff (John)", action: "UPDATE_BOOKING", method: "PATCH", path: "/bookings/72b1...", status: "INFO" },
                  { time: "08:30:55 AM", user: "Admin (Raihan)", action: "CHANGE_USER_ROLE", method: "PATCH", path: "/users/88c4...", status: "CRITICAL" },
                ].map((log, i) => (
                  <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6 text-xs font-medium text-slate-500">{log.time}</td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                            {log.user[0]}
                         </div>
                         <span className="text-sm font-bold text-slate-900">{log.user}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className={cn("text-[10px] font-black px-2 py-1 rounded-md border", 
                       log.status === "CRITICAL" ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-slate-50 text-slate-400 border-slate-100")}>
                          {log.action}
                       </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                       <code className={cn("px-2 py-1 rounded text-[10px] font-bold border", METHOD_COLORS[log.method])}>
                          {log.method} {log.path.substring(0, 12)}...
                       </code>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <button className="text-slate-300 hover:text-slate-900 transition-colors">
                          <span className="text-lg">📄</span>
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}