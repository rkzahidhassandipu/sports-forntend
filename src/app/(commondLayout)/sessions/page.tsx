import { Suspense } from "react";
import SessionsClient from "./SessionsClient";

export default function SessionsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-20 flex items-center justify-center"><div className="text-sm" style={{color:"hsl(220 12% 60%)"}}>Loading sessions...</div></div>}>
      <SessionsClient />
    </Suspense>
  );
}
