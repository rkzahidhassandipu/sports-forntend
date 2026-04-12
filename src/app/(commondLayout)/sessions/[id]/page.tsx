"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { SESSIONS } from "@/lib/data";
import { SessionCard } from "@/components/sessions/SessionCard";
import { formatCurrency } from "@/lib/utils";

const REVIEWS = [
  { id: "r1", name: "Arif Rahman", initials: "AR", rating: 5, date: "Apr 5, 2026", text: "Best coaching I have ever received. The coach is incredibly patient and knowledgeable. My skills improved dramatically in just 3 weeks." },
  { id: "r2", name: "Tanvir Ahmed", initials: "TA", rating: 4, date: "Mar 28, 2026", text: "Great structured program. Dribbling improved significantly. The facilities are top notch and always well maintained." },
  { id: "r3", name: "Sadia Karim", initials: "SK", rating: 5, date: "Mar 15, 2026", text: "Highly recommend to anyone serious about improving. The coach's attention to individual technique is exceptional." },
];

export default function SessionDetailPage() {
  const { id } = useParams();
  const session = SESSIONS.find((s) => s.id === id) || SESSIONS[0];
  const related = SESSIONS.filter((s) => s.sport === session.sport && s.id !== session.id).slice(0, 2);
  const [activeImg, setActiveImg] = useState(0);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "info" | "reviews">("overview");

  const GALLERY_ICONS = [session.icon, "🏟️", "👟", "🏆", "📋"];
  const spotsLeft = session.maxMembers - session.enrolledCount;

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-lime-500 transition-colors">Home</Link>
          <span>›</span>
          <Link href="/sessions" className="hover:text-lime-500 transition-colors">Sessions</Link>
          <span>›</span>
          <span className="text-foreground">{session.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Gallery */}
            <div className="mb-6">
              <div className="h-56 sm:h-72 bg-gradient-to-br from-brand-card to-brand-mid rounded-xl border border-brand-border flex items-center justify-center mb-3">
                <span className="text-8xl">{GALLERY_ICONS[activeImg]}</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {GALLERY_ICONS.map((icon, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`h-14 rounded-lg bg-brand-mid border flex items-center justify-center text-2xl transition-all duration-200 ${
                      activeImg === i ? "border-lime-500 shadow-lg shadow-lime-500/20" : "border-brand-border hover:border-lime-500/50"
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Title & Meta */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-brand-card border border-brand-border text-muted-foreground uppercase tracking-wider">{session.sport}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-brand-card border border-brand-border text-muted-foreground uppercase tracking-wider">{session.level}</span>
                {session.status === "Filling Fast" && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-lime-500/15 text-lime-500 border border-lime-500/20 uppercase tracking-wider">
                    🔥 Filling Fast
                  </span>
                )}
              </div>
              <h1 className="font-display font-black text-4xl sm:text-5xl leading-tight mb-3">{session.title}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1">
                  <span className="text-amber-400">{"★".repeat(Math.floor(session.rating))}</span>
                  <span className="font-medium text-foreground">{session.rating}</span>
                  <span>({session.reviewCount} reviews)</span>
                </div>
                <span>👤 {session.coach}</span>
                <span>📍 {session.location}</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-brand-card rounded-xl p-1 w-fit">
              {(["overview", "info", "reviews"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${
                    activeTab === tab ? "bg-brand-mid text-foreground border border-brand-border" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab === "info" ? "Key Info" : tab}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === "overview" && (
              <div className="bg-brand-mid border border-brand-border rounded-xl p-6 mb-6">
                <h3 className="font-display font-bold text-xl mb-4">OVERVIEW</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This comprehensive {session.sport.toLowerCase()} training program is designed for {session.level.toLowerCase()} players looking to elevate their game. Conducted by {session.coach}, a highly experienced coach with years of professional training background.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                  Sessions cover all fundamental techniques, strategic gameplay, physical conditioning, and mental preparation. Training takes place in our world-class {session.venue} with all equipment provided.
                </p>
                <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Duration", value: session.duration },
                    { label: "Start Date", value: session.startDate },
                    { label: "Timing", value: session.timing.split(" — ")[1] || session.timing },
                    { label: "Venue", value: session.venue },
                    { label: "Spots Left", value: `${spotsLeft} of ${session.maxMembers}` },
                    { label: "Equipment", value: "All included" },
                  ].map((item) => (
                    <div key={item.label} className="bg-brand-card rounded-lg p-3 border border-brand-border">
                      <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
                      <div className="text-sm font-semibold">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "info" && (
              <div className="bg-brand-mid border border-brand-border rounded-xl p-6 mb-6">
                <h3 className="font-display font-bold text-xl mb-4">KEY INFORMATION</h3>
                <div className="divide-y divide-brand-border">
                  {[
                    { k: "Coach", v: session.coach },
                    { k: "Duration", v: session.duration + " (3 sessions/week)" },
                    { k: "Schedule", v: session.timing },
                    { k: "Venue", v: session.venue },
                    { k: "Max Members", v: `${session.maxMembers} per batch` },
                    { k: "Equipment", v: "All training equipment provided" },
                    { k: "Age Group", v: "14 years and above" },
                    { k: "Language", v: "Bengali & English" },
                    { k: "Certificate", v: "Completion certificate issued" },
                  ].map((row) => (
                    <div key={row.k} className="flex justify-between py-3 text-sm">
                      <span className="text-muted-foreground">{row.k}</span>
                      <span className="font-medium text-right max-w-xs">{row.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="bg-brand-mid border border-brand-border rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-display font-bold text-xl">REVIEWS ({session.reviewCount})</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 text-lg">★</span>
                    <span className="font-display font-bold text-xl">{session.rating}</span>
                    <span className="text-sm text-muted-foreground">/ 5.0</span>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  {REVIEWS.map((r) => (
                    <div key={r.id} className="border-b border-brand-border pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-lime-500 to-teal-500 flex items-center justify-center text-xs font-bold text-brand-dark">
                            {r.initials}
                          </div>
                          <span className="text-sm font-semibold">{r.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400 text-xs">{"★".repeat(r.rating)}</span>
                          <span className="text-xs text-muted-foreground">{r.date}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{r.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related sessions */}
            {related.length > 0 && (
              <div>
                <h3 className="font-display font-bold text-xl mb-4">RELATED SESSIONS</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {related.map((s) => <SessionCard key={s.id} session={s} />)}
                </div>
              </div>
            )}
          </div>

          {/* Booking sidebar */}
          <div>
            <div className="bg-brand-mid border border-brand-border rounded-xl p-6 sticky top-24">
              <div className="font-display font-black text-5xl text-lime-500 leading-none mb-1">
                {formatCurrency(session.price)}
              </div>
              <div className="text-xs text-muted-foreground mb-5">per {session.duration} session</div>

              <div className="flex items-center justify-between p-3 bg-brand-card rounded-xl border border-brand-border mb-5 text-sm">
                <span className="text-muted-foreground">Spots remaining</span>
                <span className={`font-bold ${spotsLeft <= 3 ? "text-red-400" : "text-lime-500"}`}>
                  {spotsLeft} / {session.maxMembers}
                </span>
              </div>

              {session.status !== "Full" ? (
                <Link
                  href={`/booking?session=${session.id}`}
                  className="block w-full bg-lime-500 text-brand-dark font-display font-bold text-center py-4 rounded-xl hover:bg-lime-400 transition-all duration-200 active:scale-95 tracking-wide mb-3 text-base"
                >
                  BOOK SESSION
                </Link>
              ) : (
                <button disabled className="w-full bg-red-500/20 text-red-400 font-display font-bold py-4 rounded-xl text-base mb-3 cursor-not-allowed border border-red-500/20">
                  SESSION FULL
                </button>
              )}

              <div className="grid grid-cols-2 gap-2 mb-5">
                <button
                  onClick={() => setSaved(!saved)}
                  className={`py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5 ${
                    saved ? "border-red-400/50 text-red-400 bg-red-400/10" : "border-brand-border text-muted-foreground hover:border-red-400/50 hover:text-red-400"
                  }`}
                >
                  {saved ? "♥" : "♡"} {saved ? "Saved" : "Save"}
                </button>
                <button className="py-2.5 rounded-xl border border-brand-border text-muted-foreground text-sm font-medium hover:text-foreground hover:border-lime-500/50 transition-all duration-200 flex items-center justify-center gap-1.5">
                  ↗ Share
                </button>
              </div>

              <div className="text-xs text-muted-foreground text-center leading-relaxed">
                Free cancellation up to 48 hours before. Secure payment via bKash, Nagad, or card.
              </div>

              <div className="mt-5 pt-5 border-t border-brand-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-lime-500 to-teal-500 flex items-center justify-center font-display font-bold text-brand-dark text-sm">
                    {session.coach.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{session.coach}</div>
                    <div className="text-xs text-muted-foreground">Head Coach — {session.sport}</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Certified national-level coach with 10+ years of competitive training experience and multiple championship titles.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
