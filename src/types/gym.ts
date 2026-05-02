// src/types/gym.ts
import { PaymentStatus, SessionStatus, BookingStatus } from "./enums";

export interface Session {
  id: string;
  title: string;
  description?: string | null;
  coachId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  capacity: number;
  location?: string | null;
  price: number;
  status: SessionStatus; // ✅ use enum instead of string union
  category?: string | null;
  level?: string | null;
  equipment: string[];
  coverImage?: string | null;
  createdAt: string;
  updatedAt: string;

  // Optional extras
  sport?: string;
  rating?: number;
  reviewCount?: number;
  icon?: string;

  // Relations
  coach?: { name: string; avatar?: string | null };
  _count?: {                    // ✅ add this
    bookings: number;
    reviews?: number;
  };
}
export interface Booking {
  id: string;
  userId: string;
  sessionId: string;
  status: BookingStatus; // Now properly typed
  paymentStatus: PaymentStatus;
  totalAmount: number;
  notes?: string | null;
  cancelledAt?: string | null;
  confirmedAt?: string | null;
  session?: Session;
}

export interface Review {
  id: string;
  userId: string;
  sessionId: string;
  rating: number; // 1-5
  comment?: string | null;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
  user?: { name: string; avatar?: string | null };
}

/**
 * Data Transfer Objects (DTOs)
 */
export interface CreateSessionDto {
  title: string;
  description?: string;
  date: string; // ISO String
  startTime: string; // "HH:mm"
  endTime: string;
  duration: number;
  capacity: number;
  price: number;
  category?: string;
  level?: string;
  equipment?: string[];
}

export type UpdateSessionDto = Partial<CreateSessionDto>;

export interface SessionFilters {
  page?: number;
  limit?: number;
  category?: string;
  level?: string;
  coachId?: string;
  status?: SessionStatus;
  date?: string;
}