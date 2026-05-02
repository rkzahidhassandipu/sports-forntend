"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

export default function ContactManagementPage() {
  const [activeFilter, setActiveFilter] = useState("ALL");

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10 text-slate-900">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header (isStaff / isAdmin context) */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Inquiry <span className="text-lime-600">Inbox</span>
            </h1>
            <p className="text-[#7a9c6e] text-sm mt-1 font-medium italic">Manage client messages, partnership leads, and support requests.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right">
              <p className="text-[10px] font-black text-[#7a9c6e] uppercase tracking-widest">New Leads Today</p>
              <p className="text-xl font-black text-lime-600">+12</p>
            </div>
            <div className="w-12 h-12 bg-[#162513] border border-slate-200 rounded-2xl flex items-center justify-center text-xl shadow-sm">✉️</div>
          </div>
        </header>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#162513] p-3 rounded-2xl border border-slate-200/60 shadow-sm">
          <div className="flex gap-1 bg-slate-50 p-1 rounded-xl">
            {["ALL", "UNREAD", "ARCHIVED"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "px-5 py-2.5 rounded-lg text-[10px] font-black transition-all tracking-widest",
                  activeFilter === filter ? "bg-[#162513] text-[#0f1a0d] shadow-sm" : "text-[#7a9c6e] hover:text-[#7a9c6e]"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
          <button className="px-5 py-2.5 text-[10px] font-black text-rose-500 hover:bg-rose-50 rounded-xl transition-all uppercase tracking-widest">
            Delete Selected
          </button>
        </div>

        {/* Contact Table (getAllContacts route context) */}
        <div className="bg-[#162513] rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-[#7a9c6e] uppercase tracking-widest">Sender</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#7a9c6e] uppercase tracking-widest">Message Preview</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#7a9c6e] uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#7a9c6e] uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { name: "Alex Johnson", email: "alex@example.com", subject: "Partnership Inquiry", msg: "I'm interested in a corporate gym membership for our team of 50...", date: "10 mins ago", unread: true },
                { name: "Sarah Miller", email: "sarah.m@gmail.com", subject: "Session Rescheduling", msg: "Hi, I need to move my 4 PM session to tomorrow if possible...", date: "2 hours ago", unread: false },
                { name: "Mike Ross", email: "mike@legal.com", subject: "Feedback", msg: "The new boxing equipment is fantastic! Great job on the upgrade...", date: "Yesterday", unread: false },
              ].map((contact, i) => (
                <tr key={i} className={cn("hover:bg-slate-50/30 transition-colors group cursor-pointer", contact.unread && "bg-lime-50/20")}>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs", contact.unread ? "bg-[#9AD872] text-[#0f1a0d]" : "bg-slate-100 text-[#7a9c6e]")}>
                        {contact.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{contact.name}</p>
                        <p className="text-[10px] text-[#7a9c6e] font-medium">{contact.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="max-w-xs lg:max-w-md">
                      <p className="text-xs font-black text-slate-800 uppercase tracking-tight mb-1">{contact.subject}</p>
                      <p className="text-xs text-[#7a9c6e] line-clamp-1">{contact.msg}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className={cn("text-[10px] font-black uppercase tracking-tighter mb-1", contact.unread ? "text-lime-600" : "text-slate-300")}>
                        {contact.unread ? "● New Message" : "Read"}
                      </span>
                      <span className="text-[10px] text-[#7a9c6e] font-medium italic">{contact.date}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* markRead route support */}
                      <button className="p-2.5 bg-slate-100 hover:bg-slate-900 hover:text-[#f0f7ec] rounded-xl text-xs transition-all" title="Mark as Read">👁️</button>
                      {/* deleteContact route support (isAdmin only) */}
                      <button className="p-2.5 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-[#f0f7ec] rounded-xl text-xs transition-all" title="Delete Inquiry">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}