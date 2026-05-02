"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useMutation } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  MailWarning, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Loader2 
} from "lucide-react";
import NewsletterService from "@/services/newsletter.service";
import { cn } from "@/lib/utils";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState(""); // Industry standard: collect reason (Optional)

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);

  const mutation = useMutation({
    mutationFn: () => NewsletterService.unsubscribe({ email }),
  });

  const handleUnsubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || mutation.isPending) return;
    mutation.mutate();
  };

  return (
    <div className="w-full max-w-xl mx-auto px-6 py-12 relative z-10">
      {/* Top Brand/Back Navigation */}
      <nav className="mb-12 flex justify-between items-center">
        <button 
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-zinc-500 hover:text-[#f0f7ec] transition-all text-xs font-bold tracking-widest"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          BACK TO HUB
        </button>
        <ShieldCheck className="w-6 h-6 text-zinc-800" />
      </nav>

      <div className="bg-zinc-950 border border-white/[0.03] shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] rounded-[2.5rem] p-8 md:p-14 relative overflow-hidden">
        {/* Success State Overlay */}
        {mutation.isSuccess ? (
          <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-[#9AD872]/10 rounded-full flex items-center justify-center border border-[#9AD872]/20">
                <CheckCircle2 className="w-12 h-12 text-[#9AD872]" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-black rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-[#9AD872] rounded-full animate-ping" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h1 className="text-3xl font-black text-[#f0f7ec] tracking-tighter uppercase">Subscription Ended</h1>
              <p className="text-zinc-400 text-sm max-w-xs mx-auto leading-relaxed">
                You have been successfully removed from <span className="text-[#f0f7ec] font-semibold">{email}</span>. 
                We appreciate the time you spent with our community.
              </p>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <button
                onClick={() => router.push("/")}
                className="w-full bg-[#9AD872] text-[#0f1a0d] font-black py-4 rounded-2xl hover:brightness-110 transition-all active:scale-95"
              >
                GO TO HOME
              </button>
              <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest pt-2">
                Did this by mistake? <span className="text-[#9AD872] cursor-pointer hover:underline">Re-subscribe</span>
              </p>
            </div>
          </div>
        ) : (
          /* Default Form State */
          <div className="space-y-10">
            <header className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-white/5 rounded-full">
                <MailWarning className="w-3 h-3 text-rose-500" />
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Privacy Controls</span>
              </div>
              <h1 className="text-4xl font-black text-[#f0f7ec] leading-[0.9] tracking-tighter uppercase italic">
                Manage your <br />
                <span className="text-rose-600">Preferences</span>
              </h1>
              <p className="text-zinc-500 text-sm max-w-sm">
                We respect your inbox. If you’re getting too many emails, you can leave the newsletter here.
              </p>
            </header>

            <form onSubmit={handleUnsubscribe} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] pl-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  disabled={mutation.isPending}
                  className="w-full bg-zinc-900/30 border border-white/10 rounded-2xl px-6 py-4 text-[#f0f7ec] focus:border-rose-600 focus:ring-1 focus:ring-rose-600/20 outline-none transition-all placeholder:text-zinc-700 font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] pl-1">Reason (Optional)</label>
                <select 
                  className="w-full bg-zinc-900/30 border border-white/10 rounded-2xl px-6 py-4 text-zinc-400 focus:border-white/20 outline-none transition-all appearance-none text-sm"
                  onChange={(e) => setReason(e.target.value)}
                >
                  <option value="">Why are you leaving?</option>
                  <option value="too-many">Too many emails</option>
                  <option value="not-relevant">Content isn't relevant</option>
                  <option value="didnt-signup">Never signed up</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={mutation.isPending || !email}
                  className={cn(
                    "w-full font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 tracking-[0.1em] text-sm overflow-hidden relative group",
                    mutation.isPending 
                      ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" 
                      : "bg-rose-600 hover:bg-rose-500 text-[#f0f7ec] shadow-[0_10px_30px_-10px_rgba(225,29,72,0.3)]"
                  )}
                >
                  {mutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      CONFIRM UNSUBSCRIBE
                    </>
                  )}
                </button>
                
                {mutation.isError && (
                  <div className="mt-4 flex items-center gap-2 text-rose-500 bg-rose-500/5 p-4 rounded-xl border border-rose-500/10 animate-in fade-in slide-in-from-top-2 duration-300">
                    <XCircle className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Error: Request Failed</span>
                  </div>
                )}
              </div>
            </form>

            <footer className="pt-4 border-t border-white/[0.03]">
              <p className="text-[10px] text-zinc-600 leading-relaxed text-center uppercase tracking-widest font-bold">
                Protecting your data & inbox since 2024. <br />
                Your data will be permanently deleted from our mailing list.
              </p>
            </footer>
          </div>
        )}
      </div>
    </div>
  );
}

export default function IndustryStandardUnsubscribe() {
  return (
    <main className="min-h-screen w-full bg-[#050505] flex items-center justify-center relative selection:bg-rose-500/30 selection:text-rose-500">
      {/* Industry Standard Background Mesh */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-rose-500/[0.03] blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/[0.03] blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50 contrast-150 pointer-events-none" />
      </div>

      <Suspense fallback={<Loader2 className="w-10 h-10 text-zinc-800 animate-spin" />}>
        <UnsubscribeContent />
      </Suspense>
    </main>
  );
}