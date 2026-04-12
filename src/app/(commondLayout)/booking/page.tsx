import { Suspense } from "react";
import BookingClient from "./BookingClient";

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-20 flex items-center justify-center"><div className="text-sm" style={{color:"hsl(220 12% 60%)"}}>Loading booking...</div></div>}>
      <BookingClient />
    </Suspense>
  );
}
