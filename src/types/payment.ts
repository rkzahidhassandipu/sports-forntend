// src/types/payment.ts
import { PaymentStatus, PaymentMethod } from './enums';

export interface Payment {
  id: string;
  bookingId?: string | null;
  userId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  stripePaymentId?: string | null;
  invoiceUrl?: string | null;
  invoiceNumber?: string | null;
  description?: string | null;
  paidAt?: string | null;
  refundId?: string | null;
  refundAmount?: number | null;
  createdAt: string;
}

export interface PaymentFilters {
  status?: PaymentStatus;
  method?: PaymentMethod;
  page?: number;
  limit?: number;
}

export interface PaymentStats {
  totalRevenue: number;
  pendingAmount: number;
  refundedAmount: number;
  transactionCount: number;
  revenueByMonth: { month: string; total: number }[];
}