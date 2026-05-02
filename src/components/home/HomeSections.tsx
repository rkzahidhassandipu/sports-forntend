"use client";
import { useState } from "react";
import Link from "next/link";
import { SPORTS_CATEGORIES, SESSIONS } from "@/lib/data";
import { SessionCard, SessionCardSkeleton } from "@/components/sessions/SessionCard";
import { cn } from "@/lib/utils";

/* ─── Section Tag ─── */
function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block bg-[#9AD872]/10 text-[#9AD872] border border-[#9AD872]/30 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-3">
      {children}
    </span>
  );
}

/* ─── Features ─── */
const FEATURES = [
  { icon: "🏆", title: "Elite Coaching", desc: "Train with certified national-level coaches who personalize your program for peak performance results." },
  { icon: "📱", title: "Easy Booking", desc: "Book sessions in seconds. Manage schedules, reschedule, and get SMS reminders — all from your device." },
  { icon: "📊", title: "Progress Tracking", desc: "Real-time analytics and detailed fitness records to visualize your improvement and set new personal bests." },
  { icon: "🔒", title: "Secure Payments", desc: "Encrypted gateway with bKash, Nagad, Rocket, and all major debit/credit cards. Safe every time." },
  { icon: "🌙", title: "Flexible Timing", desc: "Morning, afternoon, and evening sessions 7 days a week designed to fit your busy lifestyle." },
  { icon: "👥", title: "Club Community", desc: "Connect with fellow athletes, join tournaments, and compete in club leagues and national championships." },
];

export function FeaturesSection() {
  return (
    <section className="py-20 bg-brand-mid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <SectionTag>Features</SectionTag>
          <h2 className="font-display font-black text-[clamp(36px,5vw,56px)] leading-tight mb-4">
            WHY SPORT<span className="text-[#9AD872]">PULSE</span>?
          </h2>
          <p className="text-muted-foreground text-base max-w-lg leading-relaxed">
            Everything you need to train smarter, perform better, and stay ahead of the competition in one platform.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group relative bg-brand-card border border-brand-border rounded-xl p-6 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-[#9AD872]/30 hover:shadow-lg hover:shadow-lime-500/5"
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-lime-500 to-teal-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              <div className="w-11 h-11 rounded-xl bg-[#9AD872]/10 border border-[#9AD872]/20 flex items-center justify-center text-xl mb-5">
                {f.icon}
              </div>
              <h3 className="font-display font-bold text-lg mb-2 tracking-wide">{f.title.toUpperCase()}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Categories ─── */
export function CategoriesSection() {
  const [active, setActive] = useState("Football");
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <SectionTag>Categories</SectionTag>
          <h2 className="font-display font-black text-[clamp(36px,5vw,56px)] leading-tight">
            CHOOSE YOUR<br /><span className="text-[#9AD872]">SPORT</span>
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {SPORTS_CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={`/sessions?sport=${cat.name.toLowerCase()}`}
              onClick={() => setActive(cat.name)}
              className={cn(
                "flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all duration-300 hover:-translate-y-1 cursor-pointer",
                active === cat.name
                  ? "bg-gradient-to-br from-lime-500/15 to-teal-500/8 border-[#9AD872]/40 shadow-lg shadow-lime-500/10"
                  : "bg-brand-mid border-brand-border hover:border-[#9AD872]/30"
              )}
            >
              <span className="text-3xl mb-2.5 block">{cat.icon}</span>
              <span className="text-xs font-semibold block mb-0.5">{cat.name}</span>
              <span className="text-[10px] text-muted-foreground">{cat.count} sessions</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Popular Sessions ─── */
export function PopularSessionsSection() {
  const [loading] = useState(false);
  const sessions = SESSIONS.slice(0, 4);

  return (
    <section className="py-20 bg-brand-mid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <SectionTag>Sessions</SectionTag>
            <h2 className="font-display font-black text-[clamp(36px,5vw,56px)] leading-tight">
              POPULAR<br /><span className="text-[#9AD872]">SESSIONS</span>
            </h2>
          </div>
          <Link href="/sessions" className="border border-brand-border text-muted-foreground font-display font-bold text-sm px-5 py-2.5 rounded-xl hover:border-[#9AD872]/50 hover:text-[#9AD872] transition-all duration-200 tracking-wide">
            VIEW ALL →
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {loading
            ? Array(4).fill(0).map((_, i) => <SessionCardSkeleton key={i} />)
            : sessions.map((s) => <SessionCard key={s.id} session={s} />)
          }
        </div>
      </div>
    </section>
  );
}

/* ─── Stats ─── */
const STATS = [
  { num: "2,400+", label: "Active Members", icon: "👥" },
  { num: "48", label: "Expert Coaches", icon: "🏆" },
  { num: "98%", label: "Satisfaction Rate", icon: "⭐" },
  { num: "12", label: "Sports Programs", icon: "⚽" },
  { num: "6+", label: "Years Running", icon: "📅" },
];

export function StatsSection() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <SectionTag>By The Numbers</SectionTag>
          <h2 className="font-display font-black text-[clamp(36px,5vw,56px)] leading-tight">
            THE STATS SPEAK
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center p-6 bg-brand-mid border border-brand-border rounded-xl hover:border-[#9AD872]/30 transition-colors duration-200">
              <div className="text-3xl mb-3">{s.icon}</div>
              <div className="font-display font-black text-4xl text-[#9AD872] leading-tight mb-1">{s.num}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Offers ─── */
const OFFERS = [
  { pct: "30%", title: "Student Discount", desc: "Show a valid student ID and get 30% off all monthly membership packages.", code: "STUDENT30", color: "lime" },
  { pct: "2×", title: "Refer & Earn", desc: "Refer a friend to SportPulse — both of you get double sessions for a full month free.", code: "REFER2X", color: "teal" },
  { pct: "FREE", title: "7-Day Trial", desc: "New members get 7 days of unlimited access to all facilities. No card required.", code: "TRYFREE7", color: "red" },
];

export function OffersSection() {
  return (
    <section className="py-20 bg-brand-mid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <SectionTag>Offers</SectionTag>
          <h2 className="font-display font-black text-[clamp(36px,5vw,56px)] leading-tight">
            EXCLUSIVE<br /><span className="text-[#9AD872]">DEALS</span>
          </h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-5">
          {OFFERS.map((o) => (
            <div key={o.title} className={cn(
              "rounded-xl p-7 border",
              o.color === "lime" && "bg-[#9AD872]/8 border-[#9AD872]/25",
              o.color === "teal" && "bg-teal-500/8 border-teal-500/25",
              o.color === "red" && "bg-red-500/8 border-red-500/25",
            )}>
              <div className={cn(
                "font-display font-black text-6xl leading-none mb-3",
                o.color === "lime" && "text-[#9AD872]",
                o.color === "teal" && "text-teal-500",
                o.color === "red" && "text-red-400",
              )}>
                {o.pct}
              </div>
              <h3 className="font-display font-bold text-xl mb-2">{o.title.toUpperCase()}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{o.desc}</p>
              <div className="inline-block bg-brand-dark/40 border border-dashed border-foreground/20 px-4 py-1.5 rounded-lg font-mono text-sm tracking-widest">
                {o.code}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ─── */
const TESTIMONIALS = [
  { name: "Arif Rahman", role: "Football Member, 2 yrs", rating: 5, initials: "AR", text: "SportPulse transformed my fitness journey. The coaches are world-class and the booking system is incredibly smooth. I improved more in 3 months than in 2 years on my own." },
  { name: "Sadia Karim", role: "National Swimming Champion", rating: 5, initials: "SK", text: "The swimming program is unmatched anywhere in Dhaka. I competed in national championships after just 6 months of structured training with Coach Karim." },
  { name: "Mahir Hossain", role: "Fitness Member", rating: 4, initials: "MH", text: "Amazing facilities, supportive trainers, and a vibrant community of athletes. Best decision I made for my health and well-being this year." },
  { name: "Tasnim Ahmed", role: "Boxing Trainee", rating: 5, initials: "TA", text: "The boxing bootcamp completely changed my fitness level. Trainer Jalal is motivating, disciplined, and incredibly knowledgeable about technique." },
  { name: "Rifat Zaman", role: "Tennis Member", rating: 5, initials: "RZ", text: "From complete beginner to placing third in the club championship in eight months. Coach Tahmid's method is exceptional and results speak for themselves." },
  { name: "Nusrat Begum", role: "Youth Gymnastics Parent", rating: 5, initials: "NB", text: "My daughter's confidence and coordination improved dramatically. The youth program instructors are patient, encouraging, and truly care about the children." },
];

export function TestimonialsSection() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <SectionTag>Reviews</SectionTag>
          <h2 className="font-display font-black text-[clamp(36px,5vw,56px)] leading-tight mb-4">
            WHAT MEMBERS SAY
          </h2>
          <p className="text-muted-foreground text-base max-w-md mx-auto">
            Real results from real athletes. Join thousands already training with SportPulse.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-brand-mid border border-brand-border rounded-xl p-6 hover:border-[#9AD872]/20 transition-colors duration-200">
              <div className="text-amber-400 text-sm mb-4">{"★".repeat(t.rating)}{"☆".repeat(5 - t.rating)}</div>
              <p className="text-sm text-muted-foreground leading-relaxed italic mb-5">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-lime-500 to-teal-500 flex items-center justify-center font-display font-bold text-brand-dark text-sm flex-shrink-0">
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ ─── */
const FAQS = [
  { q: "How do I book a session?", a: "Browse sessions on the Explore page, click 'Book Now' on any session, choose your preferred date and time, then complete payment. You'll receive a confirmation via SMS and email instantly." },
  { q: "Can I cancel or reschedule my booking?", a: "Yes — you can cancel or reschedule up to 24 hours before the session from your Dashboard under 'My Bookings'. Full refunds are issued for cancellations made 48+ hours in advance." },
  { q: "What payment methods are accepted?", a: "We accept bKash, Nagad, Rocket, all major debit/credit cards, and direct bank transfers. All transactions are fully encrypted and secure." },
  { q: "Are there sessions for children?", a: "Absolutely. We offer age-specific programs for children ages 6–16 in football, swimming, gymnastics, and tennis. All youth coaches are background-checked and certified." },
  { q: "Do you offer group or corporate discounts?", a: "Yes. Groups of 5+ get 15% off, and corporate packages receive 25% off plus dedicated session blocks. Contact us for custom pricing tailored to your organization." },
  { q: "How do role-based dashboards work?", a: "When you join, you select your role — Member, Coach, Trainer, or Receptionist. Each role has a tailored dashboard with the tools and data most relevant to your responsibilities." },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="py-20 bg-brand-mid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <SectionTag>FAQ</SectionTag>
          <h2 className="font-display font-black text-[clamp(36px,5vw,56px)] leading-tight">
            COMMON QUESTIONS
          </h2>
        </div>
        <div className="max-w-3xl mx-auto flex flex-col gap-2">
          {FAQS.map((f, i) => (
            <div key={i} className="bg-brand-card border border-brand-border rounded-xl overflow-hidden">
              <button
                className="w-full px-6 py-4 flex items-center justify-between text-left gap-4 hover:text-[#9AD872] transition-colors duration-200"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="text-sm font-medium">{f.q}</span>
                <span className={cn(
                  "text-lg text-muted-foreground transition-transform duration-300 flex-shrink-0",
                  open === i && "rotate-45 text-[#9AD872]"
                )}>+</span>
              </button>
              <div className={cn(
                "overflow-hidden transition-all duration-300",
                open === i ? "max-h-48" : "max-h-0"
              )}>
                <p className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Newsletter ─── */
export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email) { setSubmitted(true); setEmail(""); }
  }

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center bg-gradient-to-br from-lime-500/8 to-teal-500/5 border border-[#9AD872]/15 rounded-2xl p-12">
          <SectionTag>Newsletter</SectionTag>
          <h2 className="font-display font-black text-[clamp(32px,5vw,48px)] leading-tight mb-4">
            STAY IN THE<br /><span className="text-[#9AD872]">GAME</span>
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-8">
            Weekly session updates, training tips, exclusive member offers, and club news straight to your inbox.
          </p>
          {submitted ? (
            <div className="bg-teal-500/15 border border-teal-500/30 text-teal-500 rounded-xl px-6 py-4 text-sm font-medium">
              ✓ Subscribed successfully! Welcome to the SportPulse community.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm mx-auto flex-wrap sm:flex-nowrap">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 min-w-0 bg-brand-card border border-brand-border text-foreground placeholder:text-muted-foreground/50 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#9AD872] transition-colors"
              />
              <button
                type="submit"
                className="bg-[#9AD872] text-brand-dark font-display font-bold px-5 py-3 rounded-xl hover:bg-lime-400 transition-all duration-200 active:scale-95 text-sm tracking-wide whitespace-nowrap"
              >
                SUBSCRIBE
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
