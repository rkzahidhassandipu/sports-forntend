"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import SupportService from "@/services/support.service";
import { SupportTicket, TicketReply } from "@/types/support";
import { TicketPriority } from "@/types/enums";

// ─── Constants ────────────────────────────────────────────────────────────────

// Example of more robust status styling to prevent crashes
const STATUS_STYLE: Record<string, string> = {
  OPEN: "bg-amber-50 text-amber-600 border-amber-200",
  IN_PROGRESS: "bg-blue-50 text-blue-600 border-blue-200",
  RESOLVED: "bg-emerald-50 text-emerald-600 border-emerald-200",
  CLOSED: "bg-slate-50 text-slate-600 border-slate-200",
};

// ─── Create Ticket Modal ──────────────────────────────────────────────────────

function CreateTicketModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const { mutate, isPending, error } = useMutation({
  mutationFn: () => SupportService.createTicket({ 
    subject, 
    message, 
    priority: TicketPriority.MEDIUM
  }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["support", "my"] });
    onClose();
  },
});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-[#162513] rounded-[2rem] p-8 w-full max-w-md shadow-2xl space-y-5">
        <div>
          <h2 className="text-lg font-black">New Support Ticket</h2>
          <p className="text-xs text-slate-400 mt-1">
            Describe your issue and we'll get back to you shortly.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
              Subject
            </label>
            <input
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-lime-300 transition-all"
              placeholder="e.g. Payment failed for Elite Boxing Session"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
              Message
            </label>
            <textarea
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-lime-300 resize-none transition-all"
              placeholder="Describe your issue in detail…"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-500 font-medium">
            Failed to create ticket. Please try again.
          </p>
        )}

        <div className="flex gap-3 justify-end pt-1">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-black text-slate-400 hover:text-slate-800 transition-colors"
          >
            CANCEL
          </button>
          <button
            onClick={() => mutate()}
            disabled={isPending || !subject.trim() || !message.trim()}
            className="px-6 py-2.5 bg-lime-400 hover:bg-lime-300 disabled:opacity-40 disabled:cursor-not-allowed text-slate-900 text-xs font-black rounded-xl transition-all shadow-md shadow-lime-100"
          >
            {isPending ? "SUBMITTING…" : "SUBMIT TICKET"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Ticket Detail Drawer ─────────────────────────────────────────────────────

function TicketDetailDrawer({
  ticketId,
  onClose,
}: {
  ticketId: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [replyText, setReplyText] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["support", "ticket", ticketId],
    queryFn: () => SupportService.getTicket(ticketId),
  });

  const replyMutation = useMutation({
    mutationFn: () =>
      SupportService.replyToTicket(ticketId, { message: replyText }),
    onSuccess: () => {
      setReplyText("");
      queryClient.invalidateQueries({ queryKey: ["support", "ticket", ticketId] });
    },
  });

  const closeMutation = useMutation({
    mutationFn: () => SupportService.closeTicket(ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support", "my"] });
      queryClient.invalidateQueries({ queryKey: ["support", "ticket", ticketId] });
    },
  });

  const isClosed = data?.status === "CLOSED";

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <div className="w-full max-w-lg bg-[#162513] h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
          <h2 className="font-black text-base">Ticket Details</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-all text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-slate-400 text-sm animate-pulse">Loading ticket…</div>
          </div>
        ) : data ? (
          <>
            {/* Ticket Info */}
            <div className="px-8 py-5 border-b border-slate-50 space-y-3">
              <p className="font-black text-slate-900 text-base leading-snug">
                {data.subject}
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-tighter",
                    STATUS_STYLE[data.status] ?? STATUS_STYLE.OPEN
                  )}
                >
                  {data?.status?.replace("_", " ") ?? "OPEN"}
                </span>
                {data.priority && (
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {data.priority} PRIORITY
                  </span>
                )}
                <span className="text-[10px] text-slate-300 ml-auto">
                  #{ticketId.slice(0, 8).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Replies */}
            <div className="flex-1 overflow-y-auto px-8 py-5 space-y-3">
              {!data.replies || data.replies.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center pb-10">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl">
                    💬
                  </div>
                  <p className="text-sm text-slate-400 font-medium">No replies yet.</p>
                  <p className="text-xs text-slate-300">
                    Our team will respond shortly.
                  </p>
                </div>
              ) : (
                data.replies.map((reply: TicketReply) => (
                  <div
                    key={reply.id}
                    className={cn(
                      "rounded-2xl px-4 py-3 text-sm max-w-[85%] space-y-1",
                      reply.isStaff
                        ? "bg-slate-900 text-[#f0f7ec] ml-auto"
                        : "bg-slate-50 text-slate-800"
                    )}
                  >
                    <p
                      className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        reply.isStaff ? "text-slate-400" : "text-slate-400"
                      )}
                    >
                      {reply.isStaff ? "SUPPORT" : "YOU"}
                    </p>
                    <p className="leading-relaxed">{reply.message}</p>
                  </div>
                ))
              )}
            </div>

            {/* Reply Box */}
            <div className="px-8 py-5 border-t border-slate-100 space-y-3">
              {isClosed ? (
                <div className="text-center py-3 text-xs text-slate-400 font-medium">
                  This ticket is closed. Open a new ticket if you need further help.
                </div>
              ) : (
                <>
                  <textarea
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-lime-300 resize-none transition-all"
                    placeholder="Write a reply…"
                    rows={3}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        if (confirm("Close this ticket?")) closeMutation.mutate();
                      }}
                      disabled={closeMutation.isPending}
                      className="px-4 py-2.5 border border-slate-200 text-slate-500 text-[10px] font-black rounded-xl hover:bg-slate-50 transition-all disabled:opacity-40"
                    >
                      {closeMutation.isPending ? "CLOSING…" : "CLOSE TICKET"}
                    </button>
                    <button
                      onClick={() => replyMutation.mutate()}
                      disabled={replyMutation.isPending || !replyText.trim()}
                      className="ml-auto px-6 py-2.5 bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed text-[#f0f7ec] text-[10px] font-black rounded-xl hover:bg-black transition-all"
                    >
                      {replyMutation.isPending ? "SENDING…" : "SEND REPLY"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
            Ticket not found.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Member Support Page ──────────────────────────────────────────────────────

export default function MemberSupportPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: myTickets = [], isLoading } = useQuery<SupportTicket[]>({
    queryKey: ["support", "my"],
    queryFn: SupportService.getMyTickets,
    select: (data) => (Array.isArray(data) ? data : []),
  });

  const stats = {
    active: myTickets.filter((t) => t.status !== "CLOSED").length,
    resolved: myTickets.filter((t) => t.status === "CLOSED").length,
    inProgress: myTickets.filter((t) => t.status === "IN_PROGRESS").length,
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10 text-slate-900">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight">
              Support <span className="text-lime-600">Center</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              Get help with your account, sessions, or payments.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="self-start px-6 py-3 bg-lime-400 hover:bg-lime-300 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-lime-100"
          >
            + Create New Ticket
          </button>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Active", val: stats.active, icon: "🎫", color: "text-amber-500" },
            { label: "In Progress", val: stats.inProgress, icon: "⚙️", color: "text-blue-500" },
            { label: "Resolved", val: stats.resolved, icon: "✅", color: "text-emerald-500" },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-[#162513] p-5 rounded-[1.5rem] border border-slate-200/60 shadow-sm flex items-center gap-4"
            >
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-lg shrink-0">
                {s.icon}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                  {s.label}
                </p>
                <p className={cn("text-xl font-black", s.color)}>{s.val}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tickets */}
        <div className="bg-[#162513] rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="px-8 py-5 border-b border-slate-100">
            <h3 className="font-bold text-base">My Tickets</h3>
          </div>

          {isLoading ? (
            <div className="py-16 text-center text-slate-400 text-sm animate-pulse">
              Loading tickets…
            </div>
          ) : myTickets.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <p className="text-2xl">🎫</p>
              <p className="text-sm text-slate-400 font-medium">No tickets yet.</p>
              <p className="text-xs text-slate-300">
                Create one if you need help with anything.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    {["Ticket ID", "Subject", "Status", "Updated", ""].map((h) => (
                      <th
                        key={h}
                        className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {myTickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      onClick={() => setSelectedId(ticket.id)}
                      className="hover:bg-slate-50/40 transition-colors cursor-pointer group"
                    >
                      <td className="px-8 py-5 text-xs font-black text-slate-300">
                        #{ticket.id.slice(0, 6).toUpperCase()}
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-sm font-bold text-slate-900 group-hover:text-lime-600 transition-colors line-clamp-1">
                          {ticket.subject}
                        </p>
                      </td>
                      <td className="px-8 py-5">
                        <span
                          className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black border uppercase",
                            STATUS_STYLE[ticket.status] ?? STATUS_STYLE.OPEN
                          )}
                        >
                          {ticket.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-xs text-slate-400 font-medium whitespace-nowrap">
                        {new Date(ticket.updatedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button className="px-4 py-2 bg-slate-900 text-[#f0f7ec] text-[10px] font-black rounded-lg hover:bg-black transition-all">
                          VIEW
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

      {showCreate && <CreateTicketModal onClose={() => setShowCreate(false)} />}
      {selectedId && (
        <TicketDetailDrawer
          ticketId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}