// src/services/payment.service.ts
import { api } from "@/lib/api";
import { Payment, PaymentFilters, PaymentStats } from "@/types/payment";


const PaymentService = {
  /**
   * Member Access (Self)
   */
  async getMyPayments(): Promise<Payment[]> {
    const { data } = await api.get('/payments/my');
    return data;
  },

  async downloadInvoice(paymentId: string): Promise<Blob> {
    const { data } = await api.get(`/payments/my/invoice/${paymentId}`, {
      responseType: 'blob', // Essential for file downloads
    });
    return data;
  },

  /**
   * Admin & Staff Management
   */
  async getAll(params?: PaymentFilters): Promise<Payment[]> {
    const { data } = await api.get('/payments', { params });
    return data;
  },

  async getById(id: string): Promise<Payment> {
    const { data } = await api.get(`/payments/${id}`);
    return data;
  },

  async refund(id: string): Promise<Payment> {
    const { data } = await api.post(`/payments/${id}/refund`);
    return data;
  },

  /**
   * Analytics (Admin Only)
   * Returns aggregated payment statistics.
   */
  async getStats(): Promise<PaymentStats> {
    const { data } = await api.get('/payments/stats/summary');
    return data;
  },
};

export default PaymentService;
