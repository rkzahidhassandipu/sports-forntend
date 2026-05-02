// src/types/booking.ts
import { BookingStatus, PaymentStatus } from "./enums";
import { Session } from "./gym";
import { User } from "./user";

export interface Booking {
  id: string;
  userId: string;
  sessionId: string;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  paymentStatus: "paid" | "unpaid" | "refunded";
  totalAmount: number;
  notes?: string | null;
  cancelReason?: string | null;   // ← add this too, you're using it
  cancelledAt?: string | null;
  confirmedAt?: string | null;
  createdAt?: string;             // ← add this, used in safeFormat
  updatedAt?: string;

  // Relations
  session?: Session;              // ← this is what's missing
  user?: Pick<User, "id" | "name" | "email">;
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
