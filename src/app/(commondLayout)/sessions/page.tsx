import { Suspense } from "react";
import SessionsClient from "./SessionsClient";

export default function SessionsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-20 flex items-center justify-center"><div className="text-sm" style={{color:"#7a9c6e"}}>Loading sessions...</div></div>}>
      <SessionsClient />
    </Suspense>
  );
}
