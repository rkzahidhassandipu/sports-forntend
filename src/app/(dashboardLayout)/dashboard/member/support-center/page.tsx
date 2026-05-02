"use client";

import { useState, useEffect, useRef } from "react";
import SupportService from "@/services/support.service";
import { SupportTicket, TicketReply, CreateTicketDto } from "@/types/support";
import { TicketStatus, TicketPriority } from "@/types/enums";

// ─── Helpers ────────────────────────────────────────────────────────────────

const STATUS_META: Record<TicketStatus, { label: string; color: string }> = {
  [TicketStatus.OPEN]: { label: "Open", color: "#22c55e" },
  [TicketStatus.IN_PROGRESS]: { label: "In Progress", color: "#f59e0b" },
  [TicketStatus.RESOLVED]: { label: "Resolved", color: "#6366f1" },
  [TicketStatus.CLOSED]: { label: "Closed", color: "#6b7280" },
};

const PRIORITY_META: Record<TicketPriority, { label: string; color: string }> =
  {
    [TicketPriority.LOW]: { label: "Low", color: "#6b7280" },
    [TicketPriority.MEDIUM]: { label: "Medium", color: "#f59e0b" },
    [TicketPriority.HIGH]: { label: "High", color: "#ef4444" },
    [TicketPriority.URGENT]: { label: "Urgent", color: "#dc2626" },
  };

function fmt(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Badge({
  value,
  meta,
}: {
  value: string;
  meta: { label: string; color: string };
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        background: meta.color + "22",
        color: meta.color,
        border: `1px solid ${meta.color}44`,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: meta.color,
          display: "inline-block",
        }}
      />
      {meta.label}
    </span>
  );
}

function Spinner() {
  return (
    <span
      style={{
        display: "inline-block",
        width: 18,
        height: 18,
        border: "2px solid #334155",
        borderTopColor: "#6366f1",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
      }}
    />
  );
}

// ─── Create Ticket Form ──────────────────────────────────────────────────────

function CreateTicketForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState<CreateTicketDto>({
    subject: "",
    message: "",
    priority: TicketPriority.MEDIUM,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (form.subject.trim().length < 5) {
      setError("Subject must be at least 5 characters.");
      return;
    }
    if (form.message.trim().length < 10) {
      setError("Message must be at least 10 characters.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await SupportService.createTicket(form);
      onCreated();
    } catch {
      setError("Failed to create ticket. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <label style={labelStyle}>Subject</label>
        <input
          style={inputStyle}
          placeholder="Brief summary of your issue…"
          minLength={5}
          maxLength={255}
          value={form.subject}
          onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
        />
      </div>

      <div>
        <label style={labelStyle}>Priority</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(Object.values(TicketPriority) as TicketPriority[]).map((p) => (
            <button
              key={p}
              onClick={() => setForm((prev) => ({ ...prev, priority: p }))}
              style={{
                padding: "5px 14px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
                border:
                  form.priority === p
                    ? `1.5px solid ${PRIORITY_META[p].color}`
                    : "1.5px solid #1e293b",
                background:
                  form.priority === p
                    ? PRIORITY_META[p].color + "22"
                    : "transparent",
                color: form.priority === p ? PRIORITY_META[p].color : "#64748b",
              }}
            >
              {PRIORITY_META[p].label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label style={labelStyle}>Message</label>
        <textarea
          rows={5}
          style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
          placeholder="Describe your issue in detail… (min 10 characters)"
          minLength={10}
          maxLength={5000}
          value={form.message}
          onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
        />
      </div>

      {error && (
        <p style={{ color: "#ef4444", fontSize: 13, margin: 0 }}>{error}</p>
      )}

      <button onClick={submit} disabled={loading} style={primaryBtn(loading)}>
        {loading ? <Spinner /> : "Submit Ticket"}
      </button>
    </div>
  );
}

// ─── Ticket Thread View ──────────────────────────────────────────────────────

function TicketThread({
  ticket: initial,
  onBack,
}: {
  ticket: SupportTicket;
  onBack: () => void;
}) {
  const [ticket, setTicket] = useState<
    SupportTicket & { replies: TicketReply[] }
  >({
    ...initial,
    replies: initial.replies ?? [],
  });
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [closing, setClosing] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const full = await SupportService.getTicket(initial.id);
        setTicket(full);
      } finally {
        setFetchLoading(false);
      }
    })();
  }, [initial.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket.replies]);

  async function sendReply() {
  if (!reply.trim()) return;
  setLoading(true);
  
  try {
    // 1. Send the request
    const response = await SupportService.replyToTicket(ticket.id, { message: reply });
    
    // 2. Construct the local message object 
    // This ensures that even if the backend returns a partial object, 
    // the UI has a valid ID and Timestamp immediately.
    const newReply: TicketReply = {
  id: response.id || Math.random().toString(36).substring(7),
  message: reply,
  createdAt: new Date().toISOString(),
  isStaff: false,
  ticketId: ticket.id,
  senderId: response.senderId ?? "",
  authorName: response.authorName ?? null,
};

    // 3. Update state
    setTicket(t => ({ 
      ...t, 
      replies: [...t.replies, newReply] 
    }));
    
    setReply("");
  } catch (error) {
    console.error("Failed to send reply:", error);
  } finally {
    setLoading(false);
  }
}
  async function closeTicket() {
    setClosing(true);
    try {
      await SupportService.closeTicket(ticket.id);
      setTicket((t) => ({ ...t, status: TicketStatus.CLOSED }));
    } finally {
      setClosing(false);
    }
  }

  const isClosed =
    ticket.status === TicketStatus.CLOSED ||
    ticket.status === TicketStatus.RESOLVED;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <button onClick={onBack} style={ghostBtn}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2
            style={{
              margin: 0,
              fontSize: 17,
              fontWeight: 700,
              color: "#f1f5f9",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {ticket.subject}
          </h2>
          <div
            style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}
          >
            <Badge value={ticket.status} meta={STATUS_META[ticket.status]} />
            <Badge
              value={ticket.priority}
              meta={PRIORITY_META[ticket.priority]}
            />
            <span
              style={{ fontSize: 11, color: "#475569", alignSelf: "center" }}
            >
              #{ticket.id.slice(0, 8)}
            </span>
          </div>
        </div>
        {!isClosed && (
          <button
            onClick={closeTicket}
            disabled={closing}
            style={{
              ...ghostBtn,
              fontSize: 12,
              padding: "6px 14px",
              borderRadius: 8,
              whiteSpace: "nowrap",
            }}
          >
            {closing ? <Spinner /> : "Close"}
          </button>
        )}
      </div>

      {/* Thread */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          paddingRight: 4,
          marginBottom: 16,
        }}
      >
        {/* Original message */}
        <Bubble
          message={ticket.message}
          time={ticket.createdAt}
          isStaff={false}
          isOriginal
        />

        {fetchLoading && (
          <div
            style={{ display: "flex", justifyContent: "center", padding: 20 }}
          >
            <Spinner />
          </div>
        )}

        {ticket.replies.map((r, index) => (
          <Bubble
            key={r.id ? `${r.id}-${index}` : index}
            message={r.message}
            time={r.createdAt}
            isStaff={r.isStaff}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Reply input */}
      {!isClosed && (
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          <textarea
            rows={2}
            style={{ ...inputStyle, flex: 1, resize: "none" }}
            placeholder="Write a reply…"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendReply();
              }
            }}
          />
          <button
            onClick={sendReply}
            disabled={loading || !reply.trim()}
            style={primaryBtn(loading || !reply.trim())}
          >
            {loading ? (
              <Spinner />
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            )}
          </button>
        </div>
      )}
      {isClosed && (
        <p
          style={{
            textAlign: "center",
            color: "#475569",
            fontSize: 13,
            margin: 0,
          }}
        >
          This ticket is {STATUS_META[ticket.status].label.toLowerCase()}. Open
          a new ticket if you need further help.
        </p>
      )}
    </div>
  );
}

function Bubble({
  message,
  time,
  isStaff,
  isOriginal,
}: {
  message: string;
  time: string;
  isStaff: boolean;
  isOriginal?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isStaff ? "flex-start" : "flex-end",
      }}
    >
      <div
        style={{
          maxWidth: "80%",
          padding: "10px 14px",
          borderRadius: isStaff ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
          background: isStaff ? "#1e293b" : isOriginal ? "#312e81" : "#4338ca",
          color: "#e2e8f0",
          fontSize: 14,
          lineHeight: 1.6,
          border: isOriginal ? "1px solid #4338ca88" : "1px solid transparent",
        }}
      >
        {isOriginal && (
          <p
            style={{
              margin: "0 0 4px",
              fontSize: 11,
              color: "#818cf8",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Original request
          </p>
        )}
        <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{message}</p>
      </div>
      <span
        style={{
          fontSize: 11,
          color: "#475569",
          marginTop: 4,
          padding: "0 4px",
        }}
      >
        {isStaff ? "Support · " : ""}
        {fmt(time)}
      </span>
    </div>
  );
}

// ─── Ticket List ─────────────────────────────────────────────────────────────

function TicketList({
  tickets,
  onSelect,
}: {
  tickets: SupportTicket[];
  onSelect: (t: SupportTicket) => void;
}) {
  if (tickets.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "48px 0", color: "#475569" }}>
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#334155"
          strokeWidth="1.5"
          style={{ marginBottom: 12 }}
        >
          <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 01-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 011-.96l7-2 7 2A1 1 0 0120 6v7z" />
        </svg>
        <p style={{ margin: 0, fontWeight: 600, color: "#64748b" }}>
          No tickets yet
        </p>
        <p style={{ margin: "4px 0 0", fontSize: 13 }}>
          Submit a ticket to get help from our team.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {tickets.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "14px 16px",
            background: "#0f172a",
            border: "1px solid #1e293b",
            borderRadius: 12,
            cursor: "pointer",
            textAlign: "left",
            transition: "border-color 0.15s, background 0.15s",
            width: "100%",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              "#6366f1";
            (e.currentTarget as HTMLButtonElement).style.background =
              "#1e1b4b22";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              "#1e293b";
            (e.currentTarget as HTMLButtonElement).style.background = "#0f172a";
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              flexShrink: 0,
              background: "#1e293b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6366f1"
              strokeWidth="2"
            >
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                fontWeight: 600,
                color: "#f1f5f9",
                fontSize: 14,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {t.subject}
            </p>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: "#475569" }}>
              {fmt(t.createdAt)}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 6,
              flexShrink: 0,
            }}
          >
            <Badge value={t.status} meta={STATUS_META[t.status]} />
            <Badge value={t.priority} meta={PRIORITY_META[t.priority]} />
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────

type View = "list" | "create" | "thread";

export default function SupportCenter() {
  const [view, setView] = useState<View>("list");
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const [listLoading, setListLoading] = useState(true);

  async function loadTickets() {
    setListLoading(true);
    try {
      const data = await SupportService.getMyTickets();
      setTickets(data);
    } finally {
      setListLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();
  }, []);

  function openThread(t: SupportTicket) {
    setSelected(t);
    setView("thread");
  }

  function afterCreate() {
    loadTickets();
    setView("list");
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
      `}</style>

      <div
        style={{
          fontFamily: "'Syne', sans-serif",
          background: "#080c14",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 16px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 560,
            background: "#0d1117",
            border: "1px solid #1e293b",
            borderRadius: 20,
            padding: "28px 28px 24px",
            animation: "fadeUp 0.35s ease both",
            display: "flex",
            flexDirection: "column",
            minHeight: view === "thread" ? 560 : undefined,
            maxHeight: view === "thread" ? "80vh" : undefined,
          }}
        >
          {/* ── HEADER ── */}
          {view !== "thread" && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
              }}
            >
              <div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#f8fafc",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Support
                </h1>
                <p
                  style={{ margin: "2px 0 0", fontSize: 13, color: "#475569" }}
                >
                  {view === "list"
                    ? `${tickets.length} ticket${tickets.length !== 1 ? "s" : ""}`
                    : "New ticket"}
                </p>
              </div>

              {view === "list" && (
                <button
                  onClick={() => setView("create")}
                  style={primaryBtn(false)}
                >
                  + New Ticket
                </button>
              )}
              {view === "create" && (
                <button onClick={() => setView("list")} style={ghostBtn}>
                  Cancel
                </button>
              )}
            </div>
          )}

          {/* ── BODY ── */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {view === "list" &&
              (listLoading ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: 40,
                  }}
                >
                  <Spinner />
                </div>
              ) : (
                <TicketList tickets={tickets} onSelect={openThread} />
              ))}

            {view === "create" && <CreateTicketForm onCreated={afterCreate} />}

            {view === "thread" && selected && (
              <TicketThread
                ticket={selected}
                onBack={() => {
                  setView("list");
                  loadTickets();
                }}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: 8,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 10,
  padding: "10px 14px",
  color: "#e2e8f0",
  fontSize: 14,
  fontFamily: "inherit",
  outline: "none",
  transition: "border-color 0.15s",
};

const primaryBtn = (disabled: boolean): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  padding: "9px 18px",
  borderRadius: 10,
  border: "none",
  background: disabled ? "#312e81" : "#4338ca",
  color: disabled ? "#818cf8" : "#fff",
  fontFamily: "inherit",
  fontWeight: 700,
  fontSize: 14,
  cursor: disabled ? "not-allowed" : "pointer",
  transition: "background 0.15s",
  opacity: disabled ? 0.7 : 1,
});

const ghostBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  padding: "8px 14px",
  borderRadius: 10,
  border: "1px solid #1e293b",
  background: "transparent",
  color: "#94a3b8",
  fontFamily: "inherit",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
  transition: "border-color 0.15s, color 0.15s",
};
