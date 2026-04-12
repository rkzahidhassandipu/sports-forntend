"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

const TICKET_STATUS = {
  OPEN: "bg-amber-50 text-amber-600 border-amber-200",
  IN_PROGRESS: "bg-blue-50 text-blue-600 border-blue-200",
  CLOSED: "bg-emerald-50 text-emerald-600 border-emerald-200",
};

export default function SupportPage() {
  const [isStaffView, setIsStaffView] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10 text-slate-900">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header with Role Toggle (Simulating isStaff middleware) */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight">
              Support <span className="text-lime-600">Center</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">Get help with your account, sessions, or payments.</p>
          </div>
          
          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm self-start">
            <button 
              onClick={() => setIsStaffView(false)}
              className={cn("px-6 py-2.5 rounded-xl text-xs font-black tracking-widest transition-all", 
              !isStaffView ? "bg-slate-900 text-white" : "text-slate-400 hover:text-slate-600")}
            >
              MY TICKETS
            </button>
            <button 
              onClick={() => setIsStaffView(true)}
              className={cn("px-6 py-2.5 rounded-xl text-xs font-black tracking-widest transition-all", 
              isStaffView ? "bg-slate-900 text-white" : "text-slate-400 hover:text-slate-600")}
            >
              ALL TICKETS (STAFF)
            </button>
          </div>
        </header>

        {/* Support Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Active Tickets", val: "3", icon: "🎫", color: "text-amber-500" },
            { label: "Resolved", val: "12", icon: "✅", color: "text-emerald-500" },
            { label: "Avg. Response", val: "2.4h", icon: "⚡", color: "text-blue-500" }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm flex items-center gap-5">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl">{stat.icon}</div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className={cn("text-xl font-black", stat.color)}>{stat.val}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="font-bold text-lg">{isStaffView ? "Global Inquiries" : "Recent Conversations"}</h3>
            {!isStaffView && (
              <button className="w-full md:w-auto px-6 py-3 bg-lime-400 hover:bg-lime-300 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-lime-100">
                + Create New Ticket
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ticket ID</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Updated</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[
                  { id: "#TK-4921", subject: "Payment failed for Elite Boxing Session", status: "IN_PROGRESS", date: "2 hours ago" },
                  { id: "#TK-4885", subject: "Request to change coach for personal training", status: "OPEN", date: "5 hours ago" },
                  { id: "#TK-4712", subject: "Inquiry about monthly membership plans", status: "CLOSED", date: "2 days ago" },
                ].map((ticket, i) => (
                  <tr key={i} className="hover:bg-slate-50/30 transition-colors group cursor-pointer">
                    <td className="px-8 py-6 text-xs font-black text-slate-400">{ticket.id}</td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-slate-900 group-hover:text-lime-600 transition-colors">{ticket.subject}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn("px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-tighter", TICKET_STATUS[ticket.status])}>
                        {ticket.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-xs text-slate-500 font-medium">{ticket.date}</td>
                    <td className="px-8 py-6 text-right">
                      <button className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black rounded-lg hover:bg-black transition-all">
                        VIEW
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