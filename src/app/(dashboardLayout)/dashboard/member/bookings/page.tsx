"use client";
import { useEffect, useState } from "react";
import BookingService from "@/services/booking.service";
import { Booking } from "@/types/booking";
import { BookingStatus, PaymentStatus } from "@/types/enums";

export default function MemberBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    BookingService.getMyBookings().then(setBookings);
  }, []);

  const handleCheckout = async (bookingId: string) => {
    try {
      const { url } = await BookingService.createCheckout(bookingId);
      window.location.href = url; // Stripe-এ রিডাইরেক্ট
    } catch (error) {
      alert("Checkout failed!");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Bookings</h1>
      <div className="grid gap-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="p-4 border rounded-xl bg-card flex justify-between items-center">
            <div>
              <p className="font-medium text-sm text-muted-foreground">ID: {booking.id}</p>
              <p className="text-lg font-bold">${booking.totalAmount}</p>
              <span className={`text-xs px-2 py-1 rounded ${booking.status === 'CONFIRMED' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                {booking.status}
              </span>
            </div>
            
            {booking.paymentStatus === 'PENDING' && (
              <button 
                onClick={() => handleCheckout(booking.id)}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold"
              >
                PAY NOW
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}