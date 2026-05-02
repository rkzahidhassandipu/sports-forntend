"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import ReportService from "@/services/report.service";
import { AuditLog, ActivityLog, Report, ChartDataPoint } from "@/types/report";
import { ReportType } from "@/types/enums";

// ─── Constants ──────────────────────────────────────────────────────────────────

const TABS = ["Overview", "Bookings", "Users", "Reports", "Audit Logs", "Activity"] as const;
type Tab = (typeof TABS)[number];

const REPORT_TYPES: ReportType[] = [
  ReportType.REVENUE,
  ReportType.BOOKINGS,
  ReportType.MEMBERS,
];

// ─── Tab Icons ──────────────────────────────────────────────────────────────────

const TAB_ICONS: Record<string, React.ReactNode> = {
  Overview: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <rect x="1.5" y="1.5" width="5" height="5" rx="1.5" fill="currentColor"/>
      <rect x="8.5" y="1.5" width="5" height="5" rx="1.5" fill="currentColor" opacity=".5"/>
      <rect x="1.5" y="8.5" width="5" height="5" rx="1.5" fill="currentColor" opacity=".5"/>
      <rect x="8.5" y="8.5" width="5" height="5" rx="1.5" fill="currentColor"/>
    </svg>
  ),
  Bookings: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <rect x="1.5" y="3" width="12" height="10.5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M5 1.5v3M10 1.5v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M1.5 7h12" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  ),
  Users: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle cx="7.5" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M2 13.5c0-3.04 2.46-5.5 5.5-5.5s5.5 2.46 5.5 5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  Reports: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <rect x="2.5" y="1.5" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M5 5.5h5M5 8h5M5 10.5h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  "Audit Logs": (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M7.5 4.5v3.5l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Activity: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M1 7.5h2.5l2-5 2.5 9 2-6.5 1.5 3H14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

// ─── Helpers ────────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}
function fmtCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}
function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Bar Chart ──────────────────────────────────────────────────────────────────

function BarChart({ points, color = "#16a34a" }: { points: ChartDataPoint[]; color?: string }) {
  if (!points?.length)
    return (
      <div className="h-32 flex items-center justify-center text-xs text-[#2a3d22] font-medium">
        No data available
      </div>
    );

  const values = points.map((p) => Number(p.value) || 0);
  const max = Math.max(...values, 1);

  return (
    <div className="flex items-end gap-[3px] h-32 w-full">
      {points.map((p, i) => {
        const val = Number(p.value) || 0;
        const heightRatio = val / max;

        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group" title={`${p.label}: ${val}`}>
            <div
              className="w-full rounded-md transition-all duration-500 ease-out cursor-pointer group-hover:opacity-100"
              style={{
                height: `${Math.max(heightRatio * 100, 4)}%`,
                background: color,
                opacity: 0.5 + (heightRatio * 0.5),
              }}
            />
            {points.length <= 12 && (
              <span className="text-[9px] text-[#4a6b40] truncate w-full text-center leading-none">
                {p.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-[#1c2f17] rounded-xl", className)} />;
}

// ─── Stat Card ───────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, accent, icon, featured = false,
}: {
  label: string;
  value: string;
  sub?: string;
  accent: string;
  icon: React.ReactNode;
  featured?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative rounded-2xl p-5 overflow-hidden transition-all duration-200 group",
        featured
          ? "bg-[#468432] text-[#f0f7ec]"
          : "bg-[#162513] border border-[#2a3d22] hover:border-[#2a3d22] hover:shadow-sm"
      )}
    >
      {/* Arrow icon top-right */}
      <div className={cn(
        "absolute top-4 right-4 w-7 h-7 rounded-full border flex items-center justify-center transition-all",
        featured ? "border-white/20 text-[#f0f7ec]/60 group-hover:text-[#0f1a0d]" : "border-[#2a3d22] text-[#4a6b40] group-hover:border-[#468432] group-hover:text-[#7a9c6e]"
      )}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2.5 7.5L7.5 2.5M7.5 2.5H3.5M7.5 2.5V6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <div className={cn(
        "w-9 h-9 rounded-xl flex items-center justify-center mb-4",
        featured ? "bg-[#162513]/10" : cn("bg-opacity-10", accent)
      )}>
        <span className={featured ? "text-[#f0f7ec]" : cn("text-opacity-80", accent.replace("bg-", "text-"))}>
          {icon}
        </span>
      </div>

      <p className={cn(
        "text-[10px] font-semibold uppercase tracking-[0.12em] mb-1",
        featured ? "text-[#f0f7ec]/50" : "text-[#4a6b40]"
      )}>
        {label}
      </p>
      <p className={cn(
        "text-2xl font-bold tracking-tight",
        featured ? "text-[#f0f7ec]" : "text-[#f0f7ec]"
      )}>
        {value}
      </p>

      {sub && (
        <div className={cn(
          "mt-2 flex items-center gap-1.5 text-[11px] font-medium",
          featured ? "text-emerald-300" : "text-emerald-600"
        )}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 7L5 3l3 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {sub}
        </div>
      )}
    </div>
  );
}

// ─── Chart Card ──────────────────────────────────────────────────────────────────

function ChartCard({
  title, queryKey, fetcher, color, label,
}: {
  title: string;
  queryKey: string;
  fetcher: () => Promise<ChartDataPoint[]>;
  color?: string;
  label?: string;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["reports", queryKey],
    queryFn: fetcher,
    select: (d: any) => (Array.isArray(d?.data) ? d.data : Array.isArray(d) ? d : []),
  });

  const chartData = Array.isArray(data) ? data : [];
  const total = chartData.reduce((sum, p) => sum + p.value, 0);

  return (
    <div className="bg-[#162513] rounded-2xl border border-[#2a3d22] p-5 hover:border-[#2a3d22] hover:shadow-sm transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#f0f7ec]">{title}</h3>
        {!isLoading && chartData.length > 0 && (
          <span className="text-xs font-bold text-[#4a6b40] tabular-nums">
            {label === "currency" ? fmtCurrency(total) : fmt(total)}
          </span>
        )}
      </div>
      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : (
        <BarChart points={chartData} color={color} />
      )}
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────────

function SectionHeader({ title, count }: { title: string; count?: string }) {
  return (
    <div className="px-6 py-4 border-b border-[#2a3d22] flex items-center justify-between">
      <h3 className="text-sm font-semibold text-[#f0f7ec]">{title}</h3>
      {count && (
        <span className="text-[11px] font-semibold text-[#4a6b40] bg-[#1c2f17] px-2.5 py-1 rounded-lg border border-[#2a3d22]">
          {count}
        </span>
      )}
    </div>
  );
}

// ─── Table Shell ──────────────────────────────────────────────────────────────────

function TableShell({
  title, count, isLoading, isEmpty, emptyMsg,
  page, totalPages, onPrev, onNext, children,
}: {
  title: string; count: string; isLoading: boolean; isEmpty: boolean; emptyMsg: string;
  page: number; totalPages: number; onPrev: () => void; onNext: () => void; children: React.ReactNode;
}) {
  return (
    <div className="bg-[#162513] rounded-2xl border border-[#2a3d22] overflow-hidden">
      <SectionHeader title={title} count={count} />
      {isLoading ? (
        <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-11 w-full" />)}</div>
      ) : isEmpty ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 rounded-full bg-[#1c2f17] flex items-center justify-center mx-auto mb-3">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="3" y="2" width="12" height="14" rx="2" stroke="#d1d5db" strokeWidth="1.3"/>
              <path d="M6 6h6M6 9h6M6 12h4" stroke="#d1d5db" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="text-sm text-[#4a6b40] font-medium">{emptyMsg}</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">{children}</div>
          {totalPages > 1 && (
            <div className="px-6 py-3.5 border-t border-[#2a3d22] flex items-center justify-between bg-[#1c2f17]/30">
              <span className="text-xs text-[#4a6b40] font-medium">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button onClick={onPrev} disabled={page === 1}
                  className="px-4 py-1.5 text-xs font-semibold rounded-xl border border-[#2a3d22] text-[#7a9c6e] hover:bg-[#162513] hover:border-[#468432] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                  ← Prev
                </button>
                <button onClick={onNext} disabled={page === totalPages}
                  className="px-4 py-1.5 text-xs font-semibold rounded-xl border border-[#2a3d22] text-[#7a9c6e] hover:bg-[#162513] hover:border-[#468432] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Data Table ───────────────────────────────────────────────────────────────────

function DataTable({ rows }: { rows: any[] }) {
  if (!rows.length) return null;
  return (
    <table className="w-full text-left">
      <thead>
        <tr className="bg-[#0f1a0d] border-b border-[#2a3d22]">
          {Object.keys(rows[0]).map((k) => (
            <th key={k} className="px-5 py-3 text-[10px] font-bold text-[#4a6b40] uppercase tracking-[0.1em] whitespace-nowrap">{k}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {rows.map((row: any, i: number) => (
          <tr key={i} className="hover:bg-[#1c2f17]/40 transition-colors">
            {Object.values(row).map((v: any, j: number) => (
              <td key={j} className="px-5 py-3.5 text-xs text-[#7a9c6e] whitespace-nowrap font-medium">
                {typeof v === "string" && v.match(/^\d{4}-\d{2}-\d{2}/) ? fmtDate(v) : String(v ?? "—")}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────────

function OverviewTab() {
  const { data: overview, isLoading } = useQuery({
    queryKey: ["reports", "overview"],
    queryFn: ReportService.getOverview,
    // Unwrap the { success, message, data: { kpis: {...} } } envelope
    select: (d: any) => d?.data ?? d,
  });

  const kpis = overview?.kpis ?? {};
  const revenueGrowth = kpis?.revenue?.growth ?? 0;

  const memberCount = kpis?.members?.value || 0; 
const memberGrowth = kpis?.members?.growth || 0;
  const stats = overview ? [
    {
      label: "Total Members",
  value: fmt(memberCount), // This will now show "5"
  sub: `${memberGrowth}% growth`, // This will show "100% growth"
  accent: "bg-violet-500",
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M2.5 14c0-3.04 2.46-5.5 5.5-5.5s5.5 2.46 5.5 5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      label: "Active Sessions",
      value: fmt(kpis?.sessions?.active ?? kpis?.sessions?.value ?? 0),
      accent: "bg-sky-500",
      featured: false,
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M1 8h2l2-4.5 2.5 9 2-6.5 1.5 3.5H15" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      label: "Monthly Revenue",
      value: kpis?.revenue?.formatted ?? fmtCurrency(kpis?.revenue?.value ?? 0),
      sub: revenueGrowth >= 0 ? `${Number(revenueGrowth).toFixed(1)}% vs last month` : undefined,
      accent: "bg-emerald-500",
      featured: true,
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M8 5v6M6 9.5C6 10.33 6.67 11 7.5 11h1A1.5 1.5 0 0010 9.5v0A1.5 1.5 0 008.5 8h-1A1.5 1.5 0 016 6.5v0A1.5 1.5 0 017.5 5h1C9.33 5 10 5.67 10 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      label: "Pending Bookings",
      value: fmt(kpis?.bookings?.value ?? 0),
      accent: "bg-amber-500",
      featured: false,
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M5 1.5v3M11 1.5v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          <path d="M2 7.5h12" stroke="currentColor" strokeWidth="1.3"/>
        </svg>
      ),
    },
  ] : [];

  return (
    <div className="space-y-5">
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-[130px]" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => <StatCard key={s.label} {...s} />)}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ChartCard title="Revenue" queryKey="revenue" fetcher={ReportService.getRevenueChart} color="#16a34a" label="currency" />
        <ChartCard title="Bookings" queryKey="bookings" fetcher={ReportService.getBookingsChart} color="#0ea5e9" />
        <ChartCard title="New Members" queryKey="members" fetcher={ReportService.getMembersChart} color="#7c3aed" />
      </div>
    </div>
  );
}

// ─── Bookings Table Tab ───────────────────────────────────────────────────────────

function BookingsTableTab() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data, isLoading } = useQuery({
    queryKey: ["reports", "table", "bookings", page],
    queryFn: () => ReportService.getBookingsTable({ page, limit }),
  });
  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);
  return (
    <TableShell title="Bookings" count={`${fmt(total)} total`} isLoading={isLoading}
      isEmpty={rows.length === 0} emptyMsg="No bookings found."
      page={page} totalPages={totalPages}
      onPrev={() => setPage((p) => Math.max(1, p - 1))}
      onNext={() => setPage((p) => Math.min(totalPages, p + 1))}>
      <DataTable rows={rows} />
    </TableShell>
  );
}

// ─── Users Table Tab ──────────────────────────────────────────────────────────────

function UsersTableTab() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data, isLoading } = useQuery({
    queryKey: ["reports", "table", "users", page],
    queryFn: () => ReportService.getUsersTable({ page, limit }),
  });
  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);
  return (
    <TableShell title="Users" count={`${fmt(total)} total`} isLoading={isLoading}
      isEmpty={rows.length === 0} emptyMsg="No users found."
      page={page} totalPages={totalPages}
      onPrev={() => setPage((p) => Math.max(1, p - 1))}
      onNext={() => setPage((p) => Math.min(totalPages, p + 1))}>
      <DataTable rows={rows} />
    </TableShell>
  );
}

// ─── Reports Tab ─────────────────────────────────────────────────────────────────

function ReportsTab() {
  const queryClient = useQueryClient();
  const [reportType, setReportType] = useState<ReportType>(ReportType.REVENUE);
  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().split("T")[0];
  });
  const [to, setTo] = useState(() => new Date().toISOString().split("T")[0]);

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["reports", "list"],
    queryFn: ReportService.getReports,
    select: (d: any) => (Array.isArray(d?.data) ? d.data : Array.isArray(d) ? d : []),
  });

  const generateMutation = useMutation({
    mutationFn: () => ReportService.generateReport(reportType, { from, to }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reports", "list"] }),
  });

  const TYPE_BADGE: Record<string, string> = {
    REVENUE: "bg-emerald-50 text-emerald-700 border-emerald-200",
    BOOKINGS: "bg-sky-50 text-sky-700 border-sky-200",
    MEMBERS: "bg-violet-50 text-violet-700 border-violet-200",
  };

  return (
    <div className="space-y-5">
      {/* Generate Panel */}
      <div className="bg-[#162513] rounded-2xl border border-[#2a3d22] p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-xl bg-[#468432] flex items-center justify-center shrink-0">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1.5v10M1.5 6.5h10" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#f0f7ec]">Generate Report</h3>
            <p className="text-xs text-[#4a6b40] mt-0.5">Choose type and date range</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#4a6b40] uppercase tracking-[0.1em] block">Type</label>
            <select value={reportType} onChange={(e) => setReportType(e.target.value as ReportType)}
              className="border border-[#2a3d22] rounded-xl px-3 py-2.5 text-xs font-semibold text-[#d0e8c8] outline-none focus:ring-2 focus:ring-[#9AD872]/10 focus:border-[#9AD872]/40 bg-[#162513] cursor-pointer transition-all min-w-[110px]">
              {REPORT_TYPES.map((t, i) => <option key={`${i}-${t}`} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#4a6b40] uppercase tracking-[0.1em] block">From</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
              className="border border-[#2a3d22] rounded-xl px-3 py-2.5 text-xs font-semibold text-[#d0e8c8] outline-none focus:ring-2 focus:ring-[#9AD872]/10 focus:border-[#9AD872]/40 transition-all"/>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#4a6b40] uppercase tracking-[0.1em] block">To</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
              className="border border-[#2a3d22] rounded-xl px-3 py-2.5 text-xs font-semibold text-[#d0e8c8] outline-none focus:ring-2 focus:ring-[#9AD872]/10 focus:border-[#9AD872]/40 transition-all"/>
          </div>
          <button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}
            className="px-6 py-2.5 bg-[#468432] hover:bg-[#3a6e28] active:bg-[#2d5520] disabled:opacity-40 text-[#f0f7ec] text-xs font-semibold rounded-xl transition-all flex items-center gap-2">
            {generateMutation.isPending ? (
              <>
                <svg className="animate-spin" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="4.5" stroke="white" strokeWidth="1.5" strokeOpacity=".3"/>
                  <path d="M10.5 6A4.5 4.5 0 016 1.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Generating…
              </>
            ) : "Generate"}
          </button>
        </div>
        {generateMutation.isError && (
          <p className="mt-3 text-xs text-rose-500 font-medium flex items-center gap-1.5">
            <span>⚠</span> Failed to generate report. Please try again.
          </p>
        )}
        {generateMutation.isSuccess && (
          <p className="mt-3 text-xs text-emerald-600 font-medium flex items-center gap-1.5">
            <span>✓</span> Report generated successfully.
          </p>
        )}
      </div>

      {/* Reports List */}
      <div className="bg-[#162513] rounded-2xl border border-[#2a3d22] overflow-hidden">
        <SectionHeader title="Generated Reports" count={`${reports.length} reports`} />
        {isLoading ? (
          <div className="p-6 space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
        ) : reports.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <div className="w-11 h-11 rounded-2xl bg-[#1c2f17] flex items-center justify-center mx-auto mb-3 border border-[#2a3d22]">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="3" y="2" width="12" height="14" rx="2" stroke="#d1d5db" strokeWidth="1.3"/>
                <path d="M6 6h6M6 9h6M6 12h4" stroke="#d1d5db" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-sm text-[#4a6b40] font-medium">No reports generated yet.</p>
            <p className="text-xs text-[#2a3d22]">Use the form above to generate your first report.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {reports.map((r: Report) => (
              <div key={r.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-[#1c2f17]/40 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#1c2f17] border border-[#2a3d22] flex items-center justify-center shrink-0">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <rect x="2.5" y="1.5" width="10" height="12" rx="1.5" stroke="#9ca3af" strokeWidth="1.2"/>
                      <path d="M5 5.5h5M5 8h5M5 10.5h3" stroke="#9ca3af" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#f0f7ec] truncate">{r.title}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-wide", TYPE_BADGE[r.type] ?? "bg-[#1c2f17] text-[#7a9c6e] border-[#2a3d22]")}>
                        {r.type}
                      </span>
                      {r.period && <span className="text-xs text-[#4a6b40]">{r.period}</span>}
                      {r.generatedBy && <span className="text-xs text-[#2a3d22]">by {r.generatedBy}</span>}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-[#4a6b40] whitespace-nowrap shrink-0 font-medium">{fmtDate(r.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Audit Logs Tab ───────────────────────────────────────────────────────────────

const ACTION_BADGE: Record<string, string> = {
  CREATE: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  UPDATE: "bg-sky-50 text-sky-700 border border-sky-200",
  DELETE: "bg-rose-50 text-rose-600 border border-rose-200",
  VIEW:   "bg-[#1c2f17] text-[#7a9c6e] border border-[#2a3d22]",
  LOGIN:  "bg-violet-50 text-violet-700 border border-violet-200",
};

function AuditLogsTab() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["reports", "audit"],
    queryFn: () => ReportService.getAuditLogs(),
    select: (d: any) => (Array.isArray(d?.data) ? d.data : Array.isArray(d) ? d : []),
  });

  return (
    <div className="bg-[#162513] rounded-2xl border border-[#2a3d22] overflow-hidden">
      <SectionHeader title="Audit Logs" count={`${logs.length} entries`} />
      {isLoading ? (
        <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-11 w-full" />)}</div>
      ) : logs.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-sm text-[#4a6b40] font-medium">No audit logs found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#0f1a0d] border-b border-[#2a3d22]">
                {["Time", "Action", "Resource", "Resource ID", "User", "IP"].map((h) => (
                  <th key={h} className="px-5 py-3 text-[10px] font-bold text-[#4a6b40] uppercase tracking-[0.1em] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map((log: AuditLog) => (
                <tr key={log.id} className="hover:bg-[#1c2f17]/40 transition-colors">
                  <td className="px-5 py-3.5 text-xs text-[#4a6b40] whitespace-nowrap font-medium">{fmtDate(log.createdAt)}</td>
                  <td className="px-5 py-3.5">
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wide", ACTION_BADGE[log.action] ?? "bg-[#1c2f17] text-[#7a9c6e] border border-[#2a3d22]")}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs font-semibold text-[#d0e8c8] whitespace-nowrap">{log.resource}</td>
                  <td className="px-5 py-3.5 text-xs text-[#4a6b40] font-mono whitespace-nowrap">{log.resourceId ? log.resourceId.slice(0, 8).toUpperCase() : "—"}</td>
                  <td className="px-5 py-3.5 text-xs text-[#7a9c6e] whitespace-nowrap">{log.userId ?? "—"}</td>
                  <td className="px-5 py-3.5 text-xs text-[#4a6b40] font-mono whitespace-nowrap">{log.ipAddress ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Activity Tab ─────────────────────────────────────────────────────────────────

const ACTIVITY_STYLE: Record<string, { badge: string; dot: string }> = {
  LOGIN:   { badge: "bg-violet-50 text-violet-700 border-violet-200", dot: "bg-violet-400" },
  BOOKING: { badge: "bg-amber-50 text-amber-700 border-amber-200",    dot: "bg-amber-400" },
  PAYMENT: { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  CANCEL:  { badge: "bg-rose-50 text-rose-600 border-rose-200",       dot: "bg-rose-400" },
};

function ActivityTab() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["reports", "activity"],
    queryFn: () => ReportService.getActivityLogs(),
    select: (d: any) => (Array.isArray(d?.data) ? d.data : Array.isArray(d) ? d : []),
  });

  return (
    <div className="bg-[#162513] rounded-2xl border border-[#2a3d22] overflow-hidden">
      <SectionHeader title="Activity Feed" count={`${logs.length} events`} />
      {isLoading ? (
        <div className="p-6 space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
      ) : logs.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-sm text-[#4a6b40] font-medium">No activity recorded.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {logs.map((log: ActivityLog) => {
            const style = ACTIVITY_STYLE[log.type] ?? { badge: "bg-[#1c2f17] text-[#7a9c6e] border-[#2a3d22]", dot: "bg-[#2a3d22]" };
            return (
              <div key={log.id} className="px-6 py-4 flex items-start gap-4 hover:bg-[#1c2f17]/40 transition-colors">
                <div className={cn("w-2 h-2 rounded-full mt-2 shrink-0", style.dot)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-wide shrink-0", style.badge)}>
                      {log.type}
                    </span>
                    <span className="text-[11px] text-[#2a3d22] font-mono">{log.userId.slice(0, 8)}</span>
                  </div>
                  <p className="text-xs text-[#7a9c6e] font-medium leading-relaxed">{log.description}</p>
                </div>
                <span className="text-[11px] text-[#2a3d22] whitespace-nowrap shrink-0 font-medium pt-0.5">{fmtDate(log.createdAt)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Admin Reports Page ───────────────────────────────────────────────────────────

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ background: "#0f1a0d" }}>
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <header className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-2xl bg-[#468432] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 11L5.5 7l2.5 2.5L11 7l3 3.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 5h12M2 8h6" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity=".45"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#f0f7ec] tracking-tight">Reports & Analytics</h1>
                <p className="text-xs text-[#4a6b40] font-medium mt-0.5">Monitor performance, generate reports, and review system logs.</p>
              </div>
            </div>
          </div>

          {/* Live badge */}
          <div className="flex items-center gap-2 bg-[#162513] border border-[#2a3d22] rounded-2xl px-4 py-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-[#7a9c6e]">Live</span>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#162513] border border-[#2a3d22] rounded-2xl p-1.5 shadow-sm w-fit flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-150",
                activeTab === tab
                  ? "bg-[#468432] text-[#f0f7ec] shadow-sm"
                  : "text-[#4a6b40] hover:text-[#d0e8c8] hover:bg-[#1c2f17]"
              )}
            >
              <span className={activeTab === tab ? "opacity-90" : "opacity-50"}>
                {TAB_ICONS[tab]}
              </span>
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="pb-8">
          {activeTab === "Overview"    && <OverviewTab />}
          {activeTab === "Bookings"    && <BookingsTableTab />}
          {activeTab === "Users"       && <UsersTableTab />}
          {activeTab === "Reports"     && <ReportsTab />}
          {activeTab === "Audit Logs"  && <AuditLogsTab />}
          {activeTab === "Activity"    && <ActivityTab />}
        </div>
      </div>
    </div>
  );
}