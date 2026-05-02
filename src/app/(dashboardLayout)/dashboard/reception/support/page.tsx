"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import SupportService from "@/services/support.service";
import {
  SupportTicket,
  TicketReply,
  UpdateTicketStatusDto,
} from "@/types/support";
import { TicketStatus } from "@/types/enums";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, string> = {
  OPEN: "bg-amber-50 text-amber-600 border-amber-200",
  IN_PROGRESS: "bg-blue-50 text-blue-600 border-blue-200",
  CLOSED: "bg-emerald-50 text-emerald-600 border-emerald-200",
};

const PRIORITY_STYLE: Record<string, string> = {
  LOW: "bg-slate-50 text-[#7a9c6e] border-slate-200",
  MEDIUM: "bg-blue-50 text-blue-500 border-blue-200",
  HIGH: "bg-red-50 text-red-500 border-red-200",
};

// ─── Ticket Detail Drawer (Staff) ─────────────────────────────────────────────

function AdminTicketDrawer({
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
      queryClient.invalidateQueries({
        queryKey: ["support", "ticket", ticketId],
      });
    },
  });

  const statusMutation = useMutation({
    mutationFn: (payload: UpdateTicketStatusDto) =>
      SupportService.updateStatus(ticketId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support", "admin", "all"] });
      queryClient.invalidateQueries({
        queryKey: ["support", "ticket", ticketId],
      });
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <div className="w-full max-w-lg bg-[#162513] h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
          <h2 className="font-black text-base">Ticket Details</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-[#7a9c6e] hover:text-slate-800 transition-all text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[#7a9c6e] text-sm animate-pulse">Loading…</p>
          </div>
        ) : data ? (
          <>
            {/* Info Block */}
            <div className="px-8 py-5 border-b border-slate-50 space-y-4">
              <p className="font-black text-slate-900 text-base leading-snug">
                {data.subject}
              </p>

              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black border uppercase",
                    STATUS_STYLE[data.status] ?? STATUS_STYLE.OPEN,
                  )}
                >
                  {data?.status?.replace("_", " ") ?? "OPEN"}
                </span>
                {data.priority && (
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black border uppercase",
                      PRIORITY_STYLE[data.priority] ?? PRIORITY_STYLE.LOW,
                    )}
                  >
                    {data.priority}
                  </span>
                )}
                <span className="text-[10px] text-slate-300 ml-auto font-mono">
                  #{ticketId.slice(0, 8).toUpperCase()}
                </span>
              </div>

              {data.memberName && (
                <div className="flex items-center gap-2 text-xs text-[#7a9c6e]">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-[#7a9c6e]">
                    {data.memberName.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">{data.memberName}</span>
                </div>
              )}

              {/* Status Controls */}
              <div className="space-y-2">
                <p className="text-[10px] font-black text-[#7a9c6e] uppercase tracking-widest">
                  Change Status
                </p>
                <div className="flex gap-2">
                  {[
                    TicketStatus.OPEN,
                    TicketStatus.IN_PROGRESS,
                    TicketStatus.CLOSED,
                  ].map((s) => (
                    <button
                      key={s}
                      onClick={() => statusMutation.mutate({ status: s })}
                      disabled={statusMutation.isPending || data.status === s}
                      className={cn(
                        "px-3 py-2 text-[10px] font-black rounded-xl border transition-all",
                        data.status === s
                          ? "bg-slate-900 text-[#f0f7ec] border-slate-900 cursor-default"
                          : "bg-[#162513] text-[#7a9c6e] border-slate-200 hover:border-slate-400 hover:text-slate-800 disabled:opacity-40",
                      )}
                    >
                      {s.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Replies */}
            <div className="flex-1 overflow-y-auto px-8 py-5 space-y-3">
              {!data.replies || data.replies.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 pb-10 text-center">
                  <p className="text-2xl">💬</p>
                  <p className="text-sm text-[#7a9c6e] font-medium">
                    No replies yet.
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
                        : "bg-slate-50 text-slate-800",
                    )}
                  >
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-50">
                      {reply.isStaff
                        ? "YOU (STAFF)"
                        : (reply.authorName ?? "MEMBER")}
                    </p>
                    <p className="leading-relaxed">{reply.message}</p>
                  </div>
                ))
              )}
            </div>

            {/* Reply + Delete */}
            <div className="px-8 py-5 border-t border-slate-100 space-y-3">
              <textarea
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-lime-300 resize-none transition-all"
                placeholder="Write a staff reply…"
                rows={3}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={() => replyMutation.mutate()}
                  disabled={replyMutation.isPending || !replyText.trim()}
                  className="ml-auto px-6 py-2.5 bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed text-[#f0f7ec] text-[10px] font-black rounded-xl hover:bg-black transition-all"
                >
                  {replyMutation.isPending ? "SENDING…" : "SEND REPLY"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#7a9c6e] text-sm">
            Ticket not found.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Admin Support Page ───────────────────────────────────────────────────────

export default function AdminSupportPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: allTickets = [], isLoading } = useQuery<SupportTicket[]>({
    queryKey: ["support", "admin", "all", statusFilter, priorityFilter],
    queryFn: () =>
      SupportService.getAllTickets({
        ...(statusFilter && { status: statusFilter }),
        ...(priorityFilter && { priority: priorityFilter }),
      }),
    select: (data) => (Array.isArray(data) ? data : []),
  });

  const stats = {
    total: allTickets.length,
    open: allTickets.filter((t) => t.status === "OPEN").length,
    inProgress: allTickets.filter((t) => t.status === "IN_PROGRESS").length,
    closed: allTickets.filter((t) => t.status === "CLOSED").length,
    highPriority: allTickets.filter((t) => t.priority === "HIGH").length,
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10 text-slate-900">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header>
          <h1 className="text-3xl font-black tracking-tight">
            Support <span className="text-lime-600">Management</span>
          </h1>
          <p className="text-[#7a9c6e] text-sm mt-1 font-medium">
            Manage and respond to all member tickets.
          </p>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Total", val: stats.total, color: "text-slate-900" },
            { label: "Open", val: stats.open, color: "text-amber-500" },
            {
              label: "In Progress",
              val: stats.inProgress,
              color: "text-blue-500",
            },
            { label: "Closed", val: stats.closed, color: "text-emerald-500" },
            {
              label: "High Priority",
              val: stats.highPriority,
              color: "text-red-500",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-[#162513] p-5 rounded-[1.5rem] border border-slate-200/60 shadow-sm"
            >
              <p className="text-[10px] font-bold text-[#7a9c6e] uppercase tracking-widest">
                {s.label}
              </p>
              <p className={cn("text-2xl font-black mt-1", s.color)}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-[#162513] rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="px-8 py-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="font-bold text-base">All Tickets</h3>
            <div className="flex items-center gap-3 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-[#7a9c6e] outline-none focus:ring-2 ring-lime-300 bg-[#162513] cursor-pointer"
              >
                <option value="">All Status</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="CLOSED">Closed</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-[#7a9c6e] outline-none focus:ring-2 ring-lime-300 bg-[#162513] cursor-pointer"
              >
                <option value="">All Priority</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
              {(statusFilter || priorityFilter) && (
                <button
                  onClick={() => {
                    setStatusFilter("");
                    setPriorityFilter("");
                  }}
                  className="text-[10px] font-black text-[#7a9c6e] hover:text-slate-700 transition-colors px-2 py-2"
                >
                  CLEAR
                </button>
              )}
            </div>
          </div>

          {/* Table body */}
          {isLoading ? (
            <div className="py-16 text-center text-[#7a9c6e] text-sm animate-pulse">
              Loading tickets…
            </div>
          ) : allTickets.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <p className="text-2xl">📭</p>
              <p className="text-sm text-[#7a9c6e] font-medium">
                No tickets found.
              </p>
              {(statusFilter || priorityFilter) && (
                <p className="text-xs text-slate-300">
                  Try clearing the filters.
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    {[
                      "ID",
                      "Subject",
                      "Member",
                      "Priority",
                      "Status",
                      "Updated",
                      "",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-4 text-[10px] font-black text-[#7a9c6e] uppercase tracking-widest whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {allTickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      onClick={() => setSelectedId(ticket.id)}
                      className="hover:bg-slate-50/40 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-5 text-xs font-black text-slate-300 font-mono">
                        #{ticket.id.slice(0, 6).toUpperCase()}
                      </td>
                      <td className="px-6 py-5 max-w-[220px]">
                        <p className="text-sm font-bold text-slate-900 group-hover:text-lime-600 transition-colors line-clamp-1">
                          {ticket.subject}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-[#7a9c6e] shrink-0">
                            {(ticket.memberName ?? "?").charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs text-[#7a9c6e] font-medium whitespace-nowrap">
                            {ticket.memberName ?? "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {ticket.priority ? (
                          <span
                            className={cn(
                              "px-2.5 py-1 rounded-full text-[10px] font-black border uppercase",
                              PRIORITY_STYLE[ticket.priority] ??
                                PRIORITY_STYLE.LOW,
                            )}
                          >
                            {ticket.priority}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] font-black border uppercase",
                            STATUS_STYLE[ticket.status] ?? STATUS_STYLE.OPEN,
                          )}
                        >
                          {ticket.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-xs text-[#7a9c6e] font-medium whitespace-nowrap">
                        {new Date(ticket.updatedAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button className="px-4 py-2 bg-slate-900 text-[#f0f7ec] text-[10px] font-black rounded-lg hover:bg-black transition-all">
                          MANAGE
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

      {selectedId && (
        <AdminTicketDrawer
          ticketId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
