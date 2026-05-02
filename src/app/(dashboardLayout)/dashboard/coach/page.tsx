"use client";

/**
 * DashboardPage.tsx
 *
 * Backend response shapes:
 *  axios response.data is always:
 *    { success: true, data: <payload> }          ← ApiResponse.success
 *    { success: true, data: [...], meta: {...} }  ← ApiResponse.paginated
 *
 *  Actual payload shapes:
 *    getOverview()      → data: { kpis: { members, sessions, bookings, revenue, openTickets } }
 *    getBookingsChart() → data: Array<{ date, total, confirmed, cancelled }>
 *    getMembersChart()  → data: Array<{ date, count }>
 *    sessions endpoint  → data: Array<{ category, count }>
 *    getBookingsTable() → data: BookingRow[], meta: { page, limit, total }
 *      BookingRow: { id, status, createdAt,
 *                    user:    { id, name, email, avatar },
 *                    session: { id, title, date, startTime },
 *                    payments:[{ status, amount, method }] }
 */

import { useEffect, useState, useCallback } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { api } from "@/lib/api";
import ReportService from "@/services/report.service";

// ─── Types ────────────────────────────────────────────────────────────────────

interface KpiStat {
  value: number;
  growth?: number;
  thisMonth?: number;
  active?: number;
  formatted?: string;
}
interface OverviewKpis {
  members: KpiStat;
  sessions: KpiStat;
  bookings: KpiStat;
  revenue: KpiStat;
  openTickets: KpiStat;
}

interface BookingChartRow {
  date: string;
  total: number;
  confirmed: number;
  cancelled: number;
}
interface MemberChartRow {
  date: string;
  count: number;
}
interface SessionChartRow {
  category: string;
  count: number;
}

interface BookingPayment {
  status: string;
  amount: number | string;
  method: string;
}
interface BookingUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}
interface BookingSession {
  id: string;
  title: string;
  date: string;
  startTime?: string;
}
interface BookingRow {
  id: string;
  status: string;
  createdAt: string;
  user: BookingUser;
  session: BookingSession;
  payments: BookingPayment[];
}
interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
}

// ─── Envelope helpers ─────────────────────────────────────────────────────────

function unwrap<T>(envelope: any): T {
  if (envelope && "success" in envelope) return envelope.data as T;
  return envelope as T;
}
function unwrapMeta(envelope: any): PaginatedMeta {
  if (envelope && "meta" in envelope) return envelope.meta;
  return {
    total: envelope?.total ?? 0,
    page: envelope?.page ?? 1,
    limit: envelope?.limit ?? 10,
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PERIOD_OPTIONS = [
  { label: "7d", value: "7d" },
  { label: "30d", value: "30d" },
  { label: "90d", value: "90d" },
  { label: "1y", value: "1y" },
] as const;
type Period = (typeof PERIOD_OPTIONS)[number]["value"];

const PIE_COLORS = [
  "#378ADD",
  "#1D9E75",
  "#D4537E",
  "#BA7517",
  "#7F77DD",
  "#D85A30",
];
const PAGE_LIMIT = 10;

const TOOLTIP_STYLE = {
  background: "#fff",
  border: "0.5px solid rgba(0,0,0,.08)",
  borderRadius: 8,
  fontSize: 12,
  boxShadow: "none",
  padding: "6px 10px",
};

function fmt$(n: number) {
  return `$${n >= 1000 ? (n / 1000).toFixed(1) + "k" : n.toFixed(2)}`;
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-MY", {
    month: "short",
    day: "numeric",
  });
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function KpiSkeleton() {
  return (
    <div className="db-kpi-grid">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="db-skeleton"
          style={{ height: 84, borderRadius: 10 }}
        />
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div
      style={{
        height: 185,
        display: "flex",
        alignItems: "flex-end",
        gap: 5,
        padding: "0 4px",
      }}
    >
      {[55, 80, 45, 90, 65, 70, 85, 50, 75, 60, 48, 82].map((h, i) => (
        <div
          key={i}
          className="db-skeleton"
          style={{ flex: 1, height: `${h}%`, borderRadius: "3px 3px 0 0" }}
        />
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div style={{ padding: "4px 0" }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="db-skeleton"
          style={{ height: 44, borderRadius: 4, marginBottom: 2 }}
        />
      ))}
    </div>
  );
}

// ─── Period Pills ─────────────────────────────────────────────────────────────

function PeriodPills({
  value,
  onChange,
}: {
  value: Period;
  onChange: (p: Period) => void;
}) {
  return (
    <div className="db-pills">
      {PERIOD_OPTIONS.map((p) => (
        <button
          key={p.value}
          className={`db-pill${value === p.value ? " db-pill--active" : ""}`}
          onClick={() => onChange(p.value)}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

// ─── KPI Cards ────────────────────────────────────────────────────────────────

function KpiCards({ kpis }: { kpis: OverviewKpis }) {
  const cards = [
    {
      label: "Total members",
      value: kpis.members.value.toLocaleString(),
      sub:
        kpis.members.thisMonth != null
          ? `+${kpis.members.thisMonth} this month`
          : undefined,
      growth: kpis.members.growth,
    },
    {
      label: "Active sessions",
      value:
        kpis.sessions.active != null
          ? kpis.sessions.active.toLocaleString()
          : kpis.sessions.value.toLocaleString(),
      sub: `${kpis.sessions.value.toLocaleString()} total`,
      growth: undefined,
    },
    {
      label: "Monthly revenue",
      value: kpis.revenue.formatted ?? fmt$(kpis.revenue.value),
      sub: undefined,
      growth: kpis.revenue.growth,
    },
    {
      label: "Total bookings",
      value: kpis.bookings.value.toLocaleString(),
      sub:
        kpis.bookings.thisMonth != null
          ? `${kpis.bookings.thisMonth} this month`
          : undefined,
      growth: kpis.bookings.growth,
    },
    {
      label: "Open tickets",
      value: kpis.openTickets.value.toLocaleString(),
      sub: undefined,
      growth: undefined,
    },
  ];

  return (
    <div className="db-kpi-grid">
      {cards.map(({ label, value, sub, growth }) => (
        <div key={label} className="db-kpi-card">
          <p className="db-kpi-label">{label}</p>
          <p className="db-kpi-value">{value}</p>
          {sub && <p className="db-kpi-sub">{sub}</p>}
          {growth != null && (
            <span
              className={`db-badge ${growth >= 0 ? "db-badge--up" : "db-badge--down"}`}
            >
              {growth >= 0 ? "▲" : "▼"} {Math.abs(growth)}%
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Bookings Bar Chart ───────────────────────────────────────────────────────

function BookingsBarChart() {
  const [period, setPeriod] = useState<Period>("30d");
  const [rows, setRows] = useState<BookingChartRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    api
      .get("/reports/dashboard/bookings", { params: { period } })
      .then(({ data: envelope }) =>
        setRows(unwrap<BookingChartRow[]>(envelope)),
      )
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [period]);

  const chartData = rows.map((r) => ({
    date: fmtDate(r.date),
    Confirmed: r.confirmed,
    Cancelled: r.cancelled,
  }));

  return (
    <div className="db-card">
      <div className="db-card-header">
        <div>
          <p className="db-card-title">Bookings</p>
          <p className="db-card-sub">Confirmed vs cancelled</p>
        </div>
        <PeriodPills value={period} onChange={setPeriod} />
      </div>
      {loading && <ChartSkeleton />}
      {error && <p className="db-error-inline">Failed to load chart data</p>}
      {!loading && !error && (
        <ResponsiveContainer width="100%" height={185}>
          <BarChart
            data={chartData}
            barSize={8}
            margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(0,0,0,.06)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#bbb" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#bbb" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              cursor={{ fill: "rgba(0,0,0,.02)" }}
            />
            <Bar
              dataKey="Confirmed"
              fill="#1D9E75"
              radius={[3, 3, 0, 0]}
              stackId="s"
            />
            <Bar
              dataKey="Cancelled"
              fill="#E24B4A"
              radius={[3, 3, 0, 0]}
              stackId="s"
            />
          </BarChart>
        </ResponsiveContainer>
      )}
      {!loading && !error && (
        <div className="db-chart-legend">
          <span className="db-legend-item">
            <span className="db-legend-dot" style={{ background: "#1D9E75" }} />
            Confirmed
          </span>
          <span className="db-legend-item">
            <span className="db-legend-dot" style={{ background: "#E24B4A" }} />
            Cancelled
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Members Area Chart ───────────────────────────────────────────────────────

function MembersAreaChart() {
  const [period, setPeriod] = useState<Period>("30d");
  const [rows, setRows] = useState<MemberChartRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    api
      .get("/reports/dashboard/members", { params: { period } })
      .then(({ data: envelope }) => setRows(unwrap<MemberChartRow[]>(envelope)))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [period]);

  const chartData = rows.map((r) => ({
    date: fmtDate(r.date),
    Members: r.count,
  }));

  return (
    <div className="db-card">
      <div className="db-card-header">
        <div>
          <p className="db-card-title">New members</p>
          <p className="db-card-sub">Registrations over time</p>
        </div>
        <PeriodPills value={period} onChange={setPeriod} />
      </div>
      {loading && <ChartSkeleton />}
      {error && <p className="db-error-inline">Failed to load chart data</p>}
      {!loading && !error && (
        <ResponsiveContainer width="100%" height={185}>
          <AreaChart
            data={chartData}
            margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="grad-members" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#378ADD" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#378ADD" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(0,0,0,.06)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#bbb" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#bbb" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Area
              type="monotone"
              dataKey="Members"
              stroke="#378ADD"
              strokeWidth={2}
              fill="url(#grad-members)"
              dot={false}
              activeDot={{ r: 4, fill: "#378ADD", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

// ─── Sessions Pie Chart ───────────────────────────────────────────────────────

function SessionsPieChart() {
  const [rows, setRows] = useState<SessionChartRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .get("/reports/dashboard/sessions")
      .then(({ data: envelope }) =>
        setRows(unwrap<SessionChartRow[]>(envelope)),
      )
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const total = rows.reduce((a, b) => a + b.count, 0);
  const pieData = rows.map((r) => ({
    name: r.category || "Other",
    value: r.count,
  }));

  return (
    <div className="db-card">
      <div className="db-card-header">
        <div>
          <p className="db-card-title">Sessions by category</p>
          <p className="db-card-sub">{total.toLocaleString()} sessions total</p>
        </div>
      </div>
      {loading && <ChartSkeleton />}
      {error && <p className="db-error-inline">Failed to load chart data</p>}
      {!loading && !error && (
        <div className="db-pie-wrap">
          <ResponsiveContainer width={130} height={130}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={36}
                outerRadius={56}
                paddingAngle={2}
                strokeWidth={0}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(v: any, name: any) => {
                  const num = typeof v === "number" ? v : 0;
                  return [
                    `${num} · ${total > 0 ? Math.round((num / total) * 100) : 0}%`,
                    String(name),
                  ];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="db-legend">
            {pieData.map(({ name, value }, i) => (
              <div key={i} className="db-legend-item-row">
                <span
                  className="db-legend-dot"
                  style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                />
                <span className="db-legend-name">{name}</span>
                <span className="db-legend-pct">
                  {total > 0 ? Math.round((value / total) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Bookings Table ───────────────────────────────────────────────────────────

const STATUS_CLASS: Record<string, string> = {
  CONFIRMED: "db-status--confirmed",
  PENDING: "db-status--pending",
  CANCELLED: "db-status--cancelled",
  ATTENDED: "db-status--confirmed",
  NO_SHOW: "db-status--cancelled",
};

function BookingsTable() {
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta>({
    page: 1,
    limit: PAGE_LIMIT,
    total: 0,
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback((p: number) => {
    setLoading(true);
    setError(false);
    ReportService.getBookingsTable({ page: p, limit: PAGE_LIMIT })
      .then((envelope: any) => {
        setRows(unwrap<BookingRow[]>(envelope));
        setMeta(unwrapMeta(envelope));
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load(page);
  }, [page, load]);

  const totalPages = Math.max(1, Math.ceil(meta.total / PAGE_LIMIT));
  const rangeStart = (page - 1) * PAGE_LIMIT + 1;
  const rangeEnd = Math.min(page * PAGE_LIMIT, meta.total);

  return (
    <div className="db-table-card">
      <div className="db-table-header">
        <div>
          <p className="db-card-title">Recent bookings</p>
          {!loading && !error && (
            <p className="db-card-sub">
              {meta.total.toLocaleString()} total records
            </p>
          )}
        </div>
      </div>

      {loading && (
        <div style={{ padding: "0 1.1rem" }}>
          <TableSkeleton />
        </div>
      )}
      {error && <p className="db-error-inline">Failed to load bookings</p>}

      {!loading && !error && (
        <div className="db-tbl-scroll">
          <table className="db-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Session</th>
                <th>Date</th>
                <th>Time</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: "center",
                      color: "#ccc",
                      padding: "2rem",
                    }}
                  >
                    No bookings found
                  </td>
                </tr>
              )}
              {rows.map((row) => {
                const payment = row.payments?.[0];
                const amount = payment
                  ? `$${Number(payment.amount).toFixed(2)}`
                  : "—";
                const method = payment?.method
                  ? payment.method.charAt(0) +
                    payment.method.slice(1).toLowerCase()
                  : "—";
                return (
                  <tr key={row.id}>
                    <td>
                      <div className="db-member-cell">
                        <div className="db-avatar">
                          {row.user?.name?.charAt(0)?.toUpperCase() ?? "?"}
                        </div>
                        <div>
                          <p className="db-member-name">
                            {row.user?.name ?? "—"}
                          </p>
                          <p className="db-member-email">
                            {row.user?.email ?? ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td style={{ maxWidth: 160 }}>
                      <p style={{ fontWeight: 500, fontSize: 13, margin: 0 }}>
                        {row.session?.title ?? "—"}
                      </p>
                    </td>
                    <td className="db-td-muted">
                      {row.session?.date ? fmtDate(row.session.date) : "—"}
                    </td>
                    <td className="db-td-muted">
                      {row.session?.startTime ?? "—"}
                    </td>
                    <td
                      style={{
                        fontWeight: 500,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {amount}
                    </td>
                    <td className="db-td-muted">{method}</td>
                    <td>
                      <span
                        className={`db-status ${STATUS_CLASS[row.status] ?? "db-status--pending"}`}
                      >
                        {row.status.charAt(0) +
                          row.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && (
        <div className="db-pagination">
          <span className="db-pg-info">
            {meta.total > 0
              ? `${rangeStart}–${rangeEnd} of ${meta.total.toLocaleString()}`
              : "No results"}
          </span>
          <button
            className="db-pg-btn"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Prev
          </button>
          <span className="db-pg-label">
            Page {page} / {totalPages}
          </span>
          <button
            className="db-pg-btn"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [kpis, setKpis] = useState<OverviewKpis | null>(null);
  const [kpisLoading, setKpisL] = useState(true);
  const [kpisError, setKpisE] = useState(false);

  useEffect(() => {
    ReportService.getOverview()
      .then((envelope: any) => {
        const payload = unwrap<{ kpis: OverviewKpis }>(envelope);
        setKpis(payload.kpis);
      })
      .catch(() => setKpisE(true))
      .finally(() => setKpisL(false));
  }, []);

  return (
    <div className="db-page">
      <style>{CSS}</style>

      {/* KPIs */}
      <p className="db-section-label">Overview</p>
      {kpisLoading && <KpiSkeleton />}
      {kpisError && (
        <p className="db-error-block">
          Failed to load overview data. Please refresh.
        </p>
      )}
      {kpis && <KpiCards kpis={kpis} />}

      {/* Charts row 1 */}
      <p className="db-section-label">Analytics</p>
      <div className="db-charts-row">
        <BookingsBarChart />
        <MembersAreaChart />
      </div>

      {/* Charts row 2 — sessions only, full width */}
      <div style={{ marginBottom: "1.5rem" }}>
        <SessionsPieChart />
      </div>

      {/* Table */}
      <p className="db-section-label">Bookings</p>
      <BookingsTable />
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CSS = `
  .db-page {
    padding: 1.5rem;
    max-width: 1280px;
    margin: 0 auto;
    font-family: inherit;
  }

  /* Section label */
  .db-section-label {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: .08em;
    text-transform: uppercase;
    color: #aaa;
    margin: 0 0 12px;
  }

  /* Error states */
  .db-error-block {
    font-size: 13px;
    color: #A32D2D;
    background: #FEF2F2;
    border: 0.5px solid #FECACA;
    border-radius: 8px;
    padding: .75rem 1rem;
    margin-bottom: 1.5rem;
  }
  .db-error-inline {
    font-size: 12px;
    color: #A32D2D;
    padding: 1rem 0;
    text-align: center;
  }

  /* ── KPI grid ── */
  .db-kpi-grid {
    display: grid;
    gap: 8px;
    margin-bottom: 1.5rem;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  }
  .db-kpi-card {
    background: #F7F7F5;
    border-radius: 10px;
    padding: .85rem 1rem;
  }
  .db-kpi-label { font-size: 11px; color: #aaa; margin: 0 0 5px; }
  .db-kpi-value { font-size: 21px; font-weight: 500; color: #111; line-height: 1.1; margin: 0; }
  .db-kpi-sub   { font-size: 11px; color: #ccc; margin: 3px 0 0; }
  .db-badge {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 10px;
    margin-top: 5px;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 500;
  }
  .db-badge--up   { background: #EAF3DE; color: #3B6D11; }
  .db-badge--down { background: #FCEBEB; color: #A32D2D; }

  /* ── Chart cards ── */
  .db-charts-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 10px;
  }
  @media (max-width: 720px) {
    .db-charts-row { grid-template-columns: 1fr; }
  }

  .db-card {
    background: #fff;
    border: 0.5px solid rgba(0,0,0,.08);
    border-radius: 12px;
    padding: 1rem 1.1rem;
  }
  .db-card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 14px;
    flex-wrap: wrap;
  }
  .db-card-title { font-size: 13px; font-weight: 500; color: #111; margin: 0; }
  .db-card-sub   { font-size: 11px; color: #bbb; margin: 3px 0 0; }

  /* ── Period pills ── */
  .db-pills { display: flex; gap: 3px; flex-shrink: 0; flex-wrap: wrap; }
  .db-pill {
    font-size: 10px;
    padding: 2px 7px;
    border-radius: 20px;
    cursor: pointer;
    border: 0.5px solid rgba(0,0,0,.1);
    background: transparent;
    color: #888;
    transition: background .12s;
  }
  .db-pill:hover { background: #F7F7F5; }
  .db-pill--active {
    background: #EBF3FC;
    color: #185FA5;
    border-color: transparent;
  }

  /* ── Chart legend ── */
  .db-chart-legend {
    display: flex;
    gap: 14px;
    margin-top: 10px;
  }
  .db-legend-item {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    color: #888;
  }
  .db-legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 2px;
    flex-shrink: 0;
  }

  /* ── Pie ── */
  .db-pie-wrap { display: flex; align-items: center; gap: 20px; }
  .db-legend   { display: flex; flex-direction: column; gap: 8px; flex: 1; min-width: 0; }
  .db-legend-item-row { display: flex; align-items: center; gap: 7px; font-size: 11px; color: #555; }
  .db-legend-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .db-legend-pct  { color: #bbb; font-variant-numeric: tabular-nums; flex-shrink: 0; }

  /* ── Table card ── */
  .db-table-card {
    background: #fff;
    border: 0.5px solid rgba(0,0,0,.08);
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 1.5rem;
  }
  .db-table-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.1rem .75rem;
    border-bottom: 0.5px solid rgba(0,0,0,.06);
  }
  .db-tbl-scroll { width: 100%; overflow-x: auto; }
  .db-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .db-table th {
    font-size: 11px;
    font-weight: 500;
    color: #bbb;
    text-align: left;
    padding: 7px 10px;
    border-bottom: 0.5px solid rgba(0,0,0,.06);
    white-space: nowrap;
    background: #fff;
  }
  .db-table td {
    padding: 10px 10px;
    border-bottom: 0.5px solid rgba(0,0,0,.05);
    color: #222;
    vertical-align: middle;
  }
  .db-table tr:last-child td { border-bottom: none; }
  .db-table tbody tr:hover td { background: #FAFAF8; }

  .db-member-cell  { display: flex; align-items: center; gap: 9px; }
  .db-avatar {
    width: 30px; height: 30px;
    border-radius: 50%;
    background: #EBF3FC;
    color: #185FA5;
    font-size: 11px;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .db-member-name  { font-size: 13px; font-weight: 500; color: #111; margin: 0; line-height: 1.3; }
  .db-member-email { font-size: 11px; color: #bbb; margin: 0; }
  .db-td-muted     { color: #aaa; font-size: 12px; }

  .db-status {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 10px;
    font-weight: 500;
    white-space: nowrap;
  }
  .db-status--confirmed { background: #EAF3DE; color: #3B6D11; }
  .db-status--pending   { background: #FAEEDA; color: #854F0B; }
  .db-status--cancelled { background: #FCEBEB; color: #A32D2D; }

  /* ── Pagination ── */
  .db-pagination {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: flex-end;
    padding: .75rem 1.1rem;
    border-top: 0.5px solid rgba(0,0,0,.06);
  }
  .db-pg-info  { font-size: 11px; color: #bbb; margin-right: auto; }
  .db-pg-label { font-size: 11px; color: #aaa; }
  .db-pg-btn {
    padding: 3px 9px;
    border: 0.5px solid rgba(0,0,0,.12);
    border-radius: 5px;
    cursor: pointer;
    background: transparent;
    font-size: 11px;
    color: #444;
    transition: background .12s;
  }
  .db-pg-btn:hover:not(:disabled) { background: #F7F7F5; }
  .db-pg-btn:disabled { opacity: .3; cursor: default; }

  /* ── Skeleton ── */
  .db-skeleton {
    background: linear-gradient(90deg, #F2F2F0 25%, #EAEAE8 50%, #F2F2F0 75%);
    background-size: 200% 100%;
    animation: db-shimmer 1.4s ease infinite;
  }
  @keyframes db-shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;
