import { ReportType } from "./enums";


export interface DashboardOverview {
  totalMembers: number;
  activeSessions: number;
  monthlyRevenue: number;
  pendingBookings: number;
  revenueGrowth: number; // percentage
}

export interface ChartDataPoint {
  label: string; // e.g., "Jan", "2024-05-01"
  value: number;
}

export type ChartData = ChartDataPoint[];

export interface TableResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface Report {
  id: string;
  type: ReportType;
  title: string;
  data: any; // Complex JSON structure
  period?: string | null;
  generatedBy?: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  oldData?: any;
  newData?: any;
  ipAddress?: string | null;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;       // ✅ add this
  description: string;
  type: string;
  createdAt: string;
}