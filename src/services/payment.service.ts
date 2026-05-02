// src/services/payment.service.ts
import { api } from "@/lib/api";
import { Payment, PaymentFilters, PaymentStats } from "@/types/payment";

const PaymentService = {
  async createCheckoutSession(bookingId: string): Promise<{ url: string }> {
    const { data } = await api.post('/payments/create-checkout-session', { bookingId });
    return data.data; // Assuming the API response is { data: { url: string } }
  },

  /**
   * Member Access (Self)
   */
  async getMyPayments(params?: { page?: number; limit?: number }): Promise<any> {
    const { data } = await api.get('/payments/my', { params });
    return data;
  },

  async downloadInvoice(paymentId: string): Promise<Blob> {
    const { data } = await api.get(`/payments/my/invoice/${paymentId}`, {
      responseType: 'blob',
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
   */
  async getStats(): Promise<PaymentStats> {
    const { data } = await api.get('/payments/stats/summary');
    return data;
  },
};

export default PaymentService;