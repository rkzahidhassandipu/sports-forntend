"use client";
import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import NewsletterService from "@/services/newsletter.service";

// ─── SectionTag (local copy — remove if already imported globally) ────────────
function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-[10px] font-black uppercase tracking-[0.2em] text-[#9AD872] border border-[#9AD872]/30 bg-[#9AD872]/8 px-3 py-1 rounded-full mb-6">
      {children}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export function Newsletter() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const mutation = useMutation({
    mutationFn: () => {
      console.log("Sending:", { email, name }); // ← এখানে
      return NewsletterService.subscribe({ email, name: name || undefined });
    },
    onSuccess: (data) => {
      console.log("Success:", data); // ← এখানে
      setEmail("");
      setName("");
    },
    onError: (error) => {
      console.log("Error:", error); // ← এখানে
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || mutation.isPending) return;

    console.log(mutation.mutate());
  }

  const isSuccess = mutation.isSuccess;
  const isError = mutation.isError;
  const isPending = mutation.isPending;

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center bg-gradient-to-br from-lime-500/8 to-teal-500/5 border border-[#9AD872]/15 rounded-2xl p-12">
          <SectionTag>Newsletter</SectionTag>

          <h2 className="font-display font-black text-[clamp(32px,5vw,48px)] leading-tight mb-4">
            STAY IN THE
            <br />
            <span className="text-[#9AD872]">GAME</span>
          </h2>

          <p className="text-muted-foreground text-sm leading-relaxed mb-8">
            Weekly session updates, training tips, exclusive member offers, and
            club news straight to your inbox.
          </p>

          {/* ── Success State ── */}
          {isSuccess ? (
            <div className="bg-teal-500/15 border border-teal-500/30 text-teal-500 rounded-xl px-6 py-4 text-sm font-medium space-y-1">
              <p className="font-black">✓ Almost there!</p>
              <p className="text-teal-500/80 text-xs">
                Check your inbox for a confirmation email and click the link to
                activate your subscription.
              </p>
            </div>
          ) : (
            /* ── Form ── */
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-2 max-w-sm mx-auto"
            >
              {/* Email + submit row */}
              <div className="flex gap-2 sm:flex-nowrap flex-wrap">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    // Clear error state when user types again
                    if (isError) mutation.reset();
                  }}
                  placeholder="your@email.com"
                  required
                  disabled={isPending}
                  className="flex-1 min-w-0 bg-brand-card border border-brand-border text-foreground placeholder:text-muted-foreground/50 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#9AD872] transition-colors disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isPending || !email}
                  className={cn(
                    "font-display text-[#f0f7ec] font-bold px-5 py-3 rounded-xl text-sm tracking-wide whitespace-nowrap transition-all duration-200 ease-out active:scale-95",
                    isPending
                      ? "bg-[#9AD872]/50 text-[#f0f7ec]/70 cursor-not-allowed"
                      : "bg-[#9AD872] text-[#f0f7ec] hover:bg-lime-400",
                  )}
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5  border-2 border-brand-dark/30 border-t-brand-dark rounded-full animate-spin" />
                      SENDING
                    </span>
                  ) : (
                    "SUBSCRIBE"
                  )}
                </button>
              </div>

              {/* Error feedback */}
              {isError && (
                <p className="text-rose-500 text-xs font-medium text-left px-1">
                  ✕{" "}
                  {(mutation.error as Error)?.message ??
                    "Something went wrong. Please try again."}
                </p>
              )}

              <p className=" text-gray-400 text-sm mt-1">
                No spam, ever. Unsubscribe anytime.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
