// src/services/booking.service.ts
import { api } from "@/lib/api";
import { Booking } from "@/types/gym";
import {
  CancelBookingDto,
  CheckoutResponse,
  CreateBookingDto,
  UpdateBookingStatusDto,
} from "@/types/booking";
import { ApiResponse } from "@/types";


const BookingService = {
  /**
   * Member Actions
   */
  async create(payload: CreateBookingDto): Promise<Booking> {
  const { data } = await api.post<ApiResponse<Booking>>('/bookings', payload);
  return data.data;
},

  async getMyBookings(): Promise<Booking[]> {
    const { data } = await api.get('/bookings/my');
    return data;
  },

  async getById(id: string): Promise<Booking> {
    const { data } = await api.get(`/bookings/${id}`);
    return data;
  },

  async cancel(id: string, payload: CancelBookingDto): Promise<void> {
    await api.post(`/bookings/${id}/cancel`, payload);
  },

  /**
   * Triggers Stripe Checkout flow
   * Returns a URL to redirect the user to Stripe
   */
  async createCheckout(bookingId: string) {
  const { data } = await api.post(`/bookings/${bookingId}/checkout`);
  return data;
},

  /**
   * Staff/Admin Management
   */
  async getAllBookings(params?: {
    status?: string;
    userId?: string;
    page?: number;
    limit?: number;
  }): Promise<Booking[]> {
    const { data } = await api.get('/bookings', { params });
    return data;
  },

  async updateStatus(id: string, payload: UpdateBookingStatusDto): Promise<Booking> {
    const { data } = await api.patch(`/bookings/${id}/status`, payload);
    return data;
  },

  /**
   * Admin-only: Hard delete a booking record
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/bookings/${id}`);
  },
};

export default BookingService;
