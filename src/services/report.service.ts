
import { api } from '@/lib/api';
import { 
  DashboardOverview, 
  ChartData, 
  TableResponse, 
  Report, 
  AuditLog, 
  ActivityLog 
} from '../types/report';

const ReportService = {
  /**
   * Dashboard Charts & Overviews (Admin/Coach)
   */
  async getOverview(): Promise<DashboardOverview> {
    const { data } = await api.get('/reports/dashboard/overview');
    return data;
  },

  async getRevenueChart(): Promise<ChartData> {
    const { data } = await api.get('/reports/dashboard/revenue');
    return data;
  },

  async getBookingsChart(): Promise<ChartData> {
    const { data } = await api.get('/reports/dashboard/bookings');
    return data;
  },

  async getMembersChart(): Promise<ChartData> {
    const { data } = await api.get('/reports/dashboard/members');
    return data;
  },

  /**
   * Data Tables (Paginated)
   */
  async getBookingsTable(params?: any): Promise<TableResponse> {
    const { data } = await api.get('/reports/dashboard/tables/bookings', { params });
    return data;
  },

  async getUsersTable(params?: any): Promise<TableResponse> {
    const { data } = await api.get('/reports/dashboard/tables/users', { params });
    return data;
  },

  /**
   * System Reports & Logs (Admin Only)
   */
  async getReports(): Promise<Report[]> {
    const { data } = await api.get('/reports');
    return data;
  },

  async generateReport(type: string, dateRange: { from: string; to: string }): Promise<Report> {
    const { data } = await api.post('/reports/generate', { type, ...dateRange });
    return data;
  },

  async getAuditLogs(params?: any): Promise<AuditLog[]> {
    const { data } = await api.get('/reports/audit-logs', { params });
    return data;
  },

  async getActivityLogs(params?: any): Promise<ActivityLog[]> {
    const { data } = await api.get('/reports/activity', { params });
    return data;
  }
};

export default ReportService;