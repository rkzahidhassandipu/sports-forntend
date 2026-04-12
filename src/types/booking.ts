// src/types/booking.ts
import { BookingStatus, PaymentStatus } from "./enums";

export interface Booking {
  id: string;
  userId: string;
  sessionId: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  notes?: string | null;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  confirmedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingDto {
  sessionId: string;
  notes?: string;
}

export interface CancelBookingDto {
  reason: string;
}

export interface UpdateBookingStatusDto {
  status: BookingStatus;
}

export interface CheckoutResponse {
  /** The Stripe Checkout session URL to redirect the user to */
  url: string;
}
