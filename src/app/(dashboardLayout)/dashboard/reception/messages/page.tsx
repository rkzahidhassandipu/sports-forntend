"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Mail,
  MailOpen,
  Trash2,
  Search,
  Filter,
  ChevronRight,
  Calendar,
  User,
  MessageSquare,
  Loader2,
  Inbox,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import ContactService from "@/services/contact.service";
import { ContactForm, ContactFilters } from "@/types/contact";
import { cn } from "@/lib/utils";
import { format } from "date-fns"; // npm i date-fns (optional but recommended)
import { ApiResponse } from "@/types";

export default function AdminMessagesPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<ContactFilters>({ isRead: undefined });
  const [selectedMsg, setSelectedMsg] = useState<ContactForm | null>(null);

  // 1. Fetch Messages
  const { data: messagesData, isLoading } = useQuery<ApiResponse<ContactForm[]>>({
  queryKey: ["contacts", filters],
  queryFn: () => ContactService.getAll(filters),
});

const messages = messagesData?.data ?? [];

  // 2. Mark as Read Mutation
  const markReadMutation = useMutation({
    mutationFn: (id: string) => ContactService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      // Update local state if drawer is open
      if (selectedMsg) setSelectedMsg({ ...selectedMsg, isRead: true });
    },
  });

  const handleOpenMessage = (msg: ContactForm) => {
    setSelectedMsg(msg);
    if (!msg.isRead) {
      markReadMutation.mutate(msg.id);
    }
  };

  return (
    <div className="min-h-screen bg-black text-[#f0f7ec] pt-20">
      <div className="max-w-[1600px] mx-auto px-6 py-10">
        {/* Header Area */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/5 pb-10">
          <div className="space-y-2">
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">
              Inbound <span className="text-[#9AD872]">Messages</span>
            </h1>
            <p className="text-zinc-500 text-sm font-medium">
              Manage member inquiries and feedback from the contact portal.
            </p>
          </div>

          {/* Filters Tab */}
          <div className="flex bg-zinc-900/50 p-1 rounded-2xl border border-white/5">
            {[
              { label: "All", value: undefined },
              { label: "Unread", value: false },
              { label: "Read", value: true },
            ].map((tab) => (
              <button
                key={tab.label}
                onClick={() =>
                  setFilters({ ...filters, isRead: tab.value as any })
                }
                className={cn(
                  "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  filters.isRead === tab.value
                    ? "bg-[#9AD872] text-black shadow-lg shadow-lime-500/10"
                    : "text-zinc-500 hover:text-[#f0f7ec]",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Message List (Left Side) */}
          <div
            className={cn(
              "lg:col-span-5 space-y-3 h-[700px] overflow-y-auto no-scrollbar pr-2",
              selectedMsg ? "hidden lg:block" : "block",
            )}
          >
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-700">
                <Loader2 className="w-10 h-10 animate-spin mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">
                  Syncing with server...
                </p>
              </div>
            ) : messages?.length === 0 ? (
              <div className="text-center py-24 bg-zinc-950 rounded-[2rem] border border-dashed border-white/5">
                <Inbox className="w-12 h-12 mx-auto text-zinc-800 mb-4" />
                <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs">
                  No messages found
                </p>
              </div>
            ) : (
              messages?.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => handleOpenMessage(msg)}
                  className={cn(
                    "group relative p-6 rounded-[1.5rem] border transition-all cursor-pointer",
                    selectedMsg?.id === msg.id
                      ? "bg-[#162513] border-white text-black"
                      : "bg-zinc-950 border-white/5 text-zinc-400 hover:border-[#9AD872]/30",
                  )}
                >
                  {!msg.isRead && (
                    <div className="absolute top-6 right-6 w-2 h-2 bg-[#9AD872] rounded-full animate-pulse" />
                  )}
                  <div className="flex justify-between items-start mb-3">
                    <h3
                      className={cn(
                        "font-black uppercase tracking-tight text-lg italic",
                        selectedMsg?.id === msg.id
                          ? "text-black"
                          : "text-[#f0f7ec]",
                      )}
                    >
                      {msg.name}
                    </h3>
                    <span className="text-[10px] font-bold opacity-60">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-2 line-clamp-1">
                    {msg.subject}
                  </p>
                  <p className="text-xs opacity-50 line-clamp-2 leading-relaxed">
                    {msg.message}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Message Detail (Right Side) */}
          <div className="lg:col-span-7 sticky top-28">
            {selectedMsg ? (
              <div className="bg-zinc-950 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-right-4 duration-500">
                {/* Detail Header */}
                <div className="p-8 md:p-12 border-b border-white/5 bg-zinc-900/20">
                  <div className="flex justify-between items-start mb-8">
                    <button
                      onClick={() => setSelectedMsg(null)}
                      className="lg:hidden p-2 bg-zinc-800 rounded-full"
                    >
                      <ChevronRight className="rotate-180 w-4 h-4" />
                    </button>
                    <div className="flex gap-2">
                      <div
                        className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2",
                          selectedMsg.isRead
                            ? "bg-zinc-800 text-zinc-400"
                            : "bg-[#9AD872]/10 text-[#9AD872] border border-[#9AD872]/20",
                        )}
                      >
                        {selectedMsg.isRead ? (
                          <MailOpen size={12} />
                        ) : (
                          <Mail size={12} />
                        )}
                        {selectedMsg.isRead ? "Read" : "Unread"}
                      </div>
                    </div>
                  </div>

                  <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-[#f0f7ec] mb-6 leading-none">
                    {selectedMsg.subject}
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                        From Athlete
                      </p>
                      <p className="text-sm font-bold text-zinc-200">
                        {selectedMsg.name}
                      </p>
                      <p className="text-xs text-[#9AD872] underline cursor-pointer">
                        {selectedMsg.email}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                        Received At
                      </p>
                      <p className="text-sm font-bold text-zinc-200">
                        {format(new Date(selectedMsg.createdAt), "PPP p")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-8 md:p-12 space-y-10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-zinc-500">
                      <MessageSquare size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        Message Content
                      </span>
                    </div>
                    <p className="text-zinc-400 leading-relaxed text-sm bg-zinc-900/30 p-6 rounded-2xl border border-white/5 italic">
                      "{selectedMsg.message}"
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <a
                      href={`mailto:${selectedMsg.email}?subject=Re: ${selectedMsg.subject}`}
                      className="flex-1 bg-[#162513] text-black font-black text-[10px] uppercase tracking-[0.2em] py-5 rounded-2xl text-center hover:bg-[#9AD872] transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                      Reply via Email <ExternalLink size={14} />
                    </a>
                    <button className="flex-1 bg-zinc-900 text-rose-500 border border-rose-500/10 font-black text-[10px] uppercase tracking-[0.2em] py-5 rounded-2xl hover:bg-rose-500 hover:text-[#f0f7ec] transition-all active:scale-95 flex items-center justify-center gap-3">
                      <Trash2 size={14} /> Move to Trash
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden lg:flex flex-col items-center justify-center h-[600px] border border-dashed border-white/5 rounded-[2.5rem] bg-zinc-950/20">
                <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
                  <Mail className="w-8 h-8 text-zinc-700" />
                </div>
                <h3 className="text-zinc-600 font-black uppercase tracking-widest italic text-sm">
                  Select a message to view details
                </h3>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
