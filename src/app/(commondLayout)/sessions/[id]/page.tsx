"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";
import SessionService from "@/services/session.service";

const REVIEWS = [
  { id: "r1", name: "Arif Rahman", initials: "AR", rating: 5, date: "Apr 5, 2026", text: "Best coaching I have ever received. The coach is incredibly patient and knowledgeable." },
  { id: "r2", name: "Tanvir Ahmed", initials: "TA", rating: 4, date: "Mar 28, 2026", text: "Great structured program. Dribbling improved significantly." },
  { id: "r3", name: "Sadia Karim", initials: "SK", rating: 5, date: "Mar 15, 2026", text: "Highly recommend to anyone serious about improving." },
];

export default function SessionDetailPage() {
  const { id } = useParams();
  const [activeImg, setActiveImg] = useState(0);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "info" | "reviews">("overview");

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["session", id],
    queryFn: () => SessionService.getById(id as string),
    enabled: !!id,
  });

  const session = (response as any)?.data;

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center font-display text-[#9AD872] uppercase animate-pulse">
      Loading Session...
    </div>
  );

  if (isError || !session) return (
    <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">
      Session Data Unavailable
    </div>
  );

  // Data Mapping
  const price = typeof session.price === "string" ? parseFloat(session.price) : session.price;
  const coachName = session.coach?.name ?? "Lead Coach";
  const coachInitials = coachName.split(" ").map((n: string) => n[0]).join("");
  const spotsLeft = Math.max(0, session.capacity - (session._count?.bookings ?? 0));
  const GALLERY_ICONS = ["🏟️", "👟", "🏆", "📋"];

  return (
    <div className="min-h-screen pt-20 pb-16 bg-brand-dark text-foreground">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest">
          <Link href="/" className="hover:text-[#9AD872] transition-colors">Home</Link>
          <span>›</span>
          <Link href="/sessions" className="hover:text-[#9AD872] transition-colors">Sessions</Link>
          <span>›</span>
          <span className="text-foreground">{session.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="mb-6">
              <div className="h-56 sm:h-80 bg-brand-card rounded-2xl border border-brand-border flex items-center justify-center mb-3 overflow-hidden">
                <img 
                  src={session.coverImage || "/images/placeholder.jpg"} 
                  className="w-full h-full object-cover" 
                  alt={session.title} 
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {GALLERY_ICONS.map((icon, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`h-14 rounded-xl bg-brand-card border flex items-center justify-center text-2xl transition-all ${
                      activeImg === i ? "border-[#9AD872] bg-brand-mid" : "border-brand-border hover:border-[#9AD872]/50"
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="text-[10px] font-bold px-3 py-1 rounded-md bg-brand-card border border-brand-border text-[#9AD872] uppercase tracking-tighter">
                  {session.category}
                </span>
                <span className="text-[10px] font-bold px-3 py-1 rounded-md bg-brand-card border border-brand-border text-muted-foreground uppercase tracking-tighter">
                  {session.level}
                </span>
              </div>
              <h1 className="font-display font-black text-4xl sm:text-6xl italic leading-none uppercase mb-4 tracking-tighter">
                {session.title}
              </h1>
              <div className="flex items-center gap-6 text-sm text-muted-foreground flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400">★</span>
                  <span className="font-bold text-foreground">4.8</span>
                  <span>({session._count?.bookings ?? 0} bookings)</span>
                </div>
                <span>👤 {coachName}</span>
                <span>📍 {session.location || "On-site"}</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-8 bg-brand-card border border-brand-border rounded-2xl p-1 w-fit">
              {(["overview", "info", "reviews"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    activeTab === tab ? "bg-[#9AD872] text-brand-dark" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="bg-brand-card border border-brand-border rounded-2xl p-8 mb-6">
              {activeTab === "overview" && (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                  <h3 className="font-display font-bold text-xl mb-4 italic uppercase">Program Detail</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {session.description || `Elevate your game with this ${session.level} ${session.category} session.`}
                  </p>
                  <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatItem label="Duration" value={`${session.duration}m`} />
                    <StatItem label="Starts" value={session.startTime} />
                    <StatItem label="Capacity" value={`${session.capacity} Max`} />
                    <StatItem label="Equipment" value={session.equipment?.[0] || "Provided"} />
                  </div>
                </div>
              )}

              {activeTab === "info" && (
                <div className="divide-y divide-brand-border">
                  <InfoRow k="Time Slot" v={session.startTime} />
                  <InfoRow k="Training Days" v="Mon, Wed, Fri" />
                  <InfoRow k="Lead Coach" v={coachName} />
                  <InfoRow k="Location" v={session.location || "Main Gym"} />
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="space-y-6">
                  {REVIEWS.map((r) => (
                    <div key={r.id} className="pb-6 border-b border-brand-border last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#9AD872]/10 border border-[#9AD872]/20 flex items-center justify-center text-xs font-bold text-[#9AD872]">
                            {r.initials}
                          </div>
                          <span className="font-bold uppercase italic text-sm">{r.name}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-bold">{r.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground italic leading-relaxed">"{r.text}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-brand-card border-2 border-brand-border rounded-3xl p-8 sticky top-24 shadow-2xl">
              <div className="mb-6">
                <div className="font-display font-black text-6xl text-[#9AD872] italic leading-none">
                  {price === 0 ? "FREE" : formatCurrency(price)}
                </div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2">Per Individual Session</div>
              </div>

              <div className="flex items-center justify-between p-4 bg-brand-dark rounded-xl border border-brand-border mb-6">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Availability</span>
                <span className={`font-black text-sm ${spotsLeft <= 3 ? "text-red-500" : "text-[#9AD872]"}`}>
                  {spotsLeft} / {session.capacity} SPOTS
                </span>
              </div>

              {/* Functional Button Logic */}
              {spotsLeft > 0 ? (
                <Link 
                  href={`/booking?session=${session.id}`}
                  className="block w-full bg-[#9AD872] text-brand-dark font-display font-black text-xl py-5 rounded-2xl uppercase italic transition-all active:scale-95 mb-4 text-center hover:bg-lime-400"
                >
                  Secure Spot
                </Link>
              ) : (
                <button 
                  disabled
                  className="w-full bg-red-500/10 text-red-500 border border-red-500/20 font-display font-black text-xl py-5 rounded-2xl uppercase italic cursor-not-allowed mb-4"
                >
                  Fully Booked
                </button>
              )}

              <div className="grid grid-cols-2 gap-2 mb-6">
                <button onClick={() => setSaved(!saved)} className="py-3 rounded-xl border border-brand-border text-[10px] font-black uppercase tracking-tighter flex items-center justify-center gap-2 hover:bg-brand-mid transition-all">
                  {saved ? "❤️ Saved" : "🤍 Save"}
                </button>
                <button className="py-3 rounded-xl border border-brand-border text-[10px] font-black uppercase tracking-tighter flex items-center justify-center gap-2 hover:bg-brand-mid transition-all">
                  ↗ Share
                </button>
              </div>

              <div className="pt-6 border-t border-brand-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#9AD872]/10 flex items-center justify-center text-[#9AD872] font-display font-black">
                    {coachInitials}
                  </div>
                  <div>
                    <div className="text-sm font-black uppercase italic leading-none">{coachName}</div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Lead Instructor</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-brand-dark rounded-xl p-4 border border-brand-border">
      <div className="text-[10px] text-muted-foreground font-black uppercase mb-1">{label}</div>
      <div className="text-xs font-black uppercase italic">{value}</div>
    </div>
  );
}

function InfoRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between py-4 text-sm">
      <span className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">{k}</span>
      <span className="font-black uppercase italic text-xs">{v}</span>
    </div>
  );
}