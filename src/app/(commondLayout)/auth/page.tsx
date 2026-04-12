import { Suspense } from "react";
import AuthClient from "./AuthClient";

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-20 flex items-center justify-center"><div className="text-muted-foreground text-sm">Loading...</div></div>}>
      <AuthClient />
    </Suspense>
  );
}
