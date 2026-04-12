"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const SLIDES = [
  {
    badge: "BANGLADESH'S PREMIER SPORTS CLUB",
    headline: ["TRAIN.", "COMPETE.", "DOMINATE."],
    accent: 1,
    sub: "World-class coaching, state-of-the-art facilities, and expert trainers — all in one platform. Book sessions, track fitness, and reach your peak performance.",
    cta: { primary: { label: "EXPLORE SESSIONS", href: "/sessions" }, secondary: { label: "JOIN FREE", href: "/auth?tab=register" } },
    stat: [{ num: "2,400+", label: "Active Members" }, { num: "48", label: "Expert Coaches" }, { num: "12", label: "Sports Available" }],
  },
  {
    badge: "ELITE COACHING PROGRAMS",
    headline: ["BUILD.", "PERFORM.", "WIN."],
    accent: 1,
    sub: "From football to swimming, boxing to gymnastics — 12 sports programs with certified national coaches guiding every step of your journey.",
    cta: { primary: { label: "VIEW PROGRAMS", href: "/sessions" }, secondary: { label: "LEARN MORE", href: "/about" } },
    stat: [{ num: "98%", label: "Satisfaction Rate" }, { num: "6+", label: "Years Running" }, { num: "340+", label: "Daily Bookings" }],
  },
  {
    badge: "7-DAY FREE TRIAL",
    headline: ["START YOUR", "FITNESS", "JOURNEY."],
    accent: 2,
    sub: "New members get 7 days of unlimited access — completely free. No credit card required. Join thousands already transforming their performance.",
    cta: { primary: { label: "START FREE TRIAL", href: "/auth?tab=register" }, secondary: { label: "SEE OFFERS", href: "/sessions#offers" } },
    stat: [{ num: "৳0", label: "First Week Cost" }, { num: "7 Days", label: "Free Access" }, { num: "No Card", label: "Required" }],
  },
];

const SPORT_GRID = [
  { icon: "⚽", name: "Football", hot: true },
  { icon: "🏀", name: "Basketball", hot: false },
  { icon: "🎾", name: "Tennis", hot: false },
  { icon: "🏊", name: "Swimming", hot: true },
  { icon: "🥊", name: "Boxing", hot: false },
  { icon: "🏋️", name: "Fitness", hot: true },
];

export function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      goTo((current + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [current]);

  function goTo(idx: number) {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setIsAnimating(false);
    }, 200);
  }

  const slide = SLIDES[current];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* BG Effects */}
      <div className="absolute inset-0 bg-brand-dark" />
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 70% 60% at 75% 50%, hsla(174,85%,55%,0.1) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 15% 75%, hsla(75,100%,60%,0.07) 0%, transparent 55%)"
      }} />
      <div className="absolute inset-0" style={{
        backgroundImage: "linear-gradient(hsl(220 18% 18% / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(220 18% 18% / 0.3) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className={cn("transition-all duration-300", isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0")}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-lime-500/10 border border-lime-500/30 text-lime-500 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6">
              <span className="w-1.5 h-1.5 bg-lime-500 rounded-full animate-pulse" />
              {slide.badge}
            </div>

            {/* Headline */}
            <h1 className="font-display font-black text-[clamp(52px,8vw,92px)] leading-[0.9] tracking-tight mb-6">
              {slide.headline.map((line, i) => (
                <span key={i} className={cn("block", i === slide.accent && "text-lime-500")}>
                  {line}
                </span>
              ))}
            </h1>

            <p className="text-muted-foreground text-base leading-relaxed max-w-xl mb-8">
              {slide.sub}
            </p>

            {/* CTAs */}
            <div className="flex gap-3 flex-wrap mb-12">
              <Link
                href={slide.cta.primary.href}
                className="bg-lime-500 text-brand-dark font-display font-bold px-7 py-3.5 rounded-xl hover:bg-lime-400 transition-all duration-200 active:scale-95 tracking-wide text-base"
              >
                {slide.cta.primary.label}
              </Link>
              <Link
                href={slide.cta.secondary.href}
                className="border border-brand-border text-foreground font-display font-bold px-7 py-3.5 rounded-xl hover:border-lime-500/50 hover:text-lime-500 transition-all duration-200 tracking-wide text-base"
              >
                {slide.cta.secondary.label}
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-6 border-t border-brand-border flex-wrap">
              {slide.stat.map((s) => (
                <div key={s.label}>
                  <div className="font-display font-black text-3xl text-lime-500 leading-tight">{s.num}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Sport grid */}
          <div className="hidden lg:grid grid-cols-2 gap-3">
            {SPORT_GRID.map((sport, i) => (
              <Link
                key={sport.name}
                href={`/sessions?sport=${sport.name.toLowerCase()}`}
                className={cn(
                  "group relative flex flex-col items-center justify-center p-6 rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl text-center",
                  sport.hot
                    ? "bg-gradient-to-br from-lime-500/10 to-teal-500/5 border-lime-500/25 hover:border-lime-500/50"
                    : "bg-brand-mid border-brand-border hover:border-lime-500/30"
                )}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <span className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200 block">
                  {sport.icon}
                </span>
                <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                  {sport.name}
                </span>
                {sport.hot && (
                  <span className="absolute top-2 right-2 text-[9px] font-black bg-lime-500 text-brand-dark px-1.5 py-0.5 rounded-full tracking-wider">
                    HOT
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Carousel controls */}
        <div className="flex items-center gap-3 mt-10">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={cn(
                "rounded-full transition-all duration-300",
                i === current ? "w-8 h-2 bg-lime-500" : "w-2 h-2 bg-brand-border hover:bg-muted-foreground"
              )}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
          <div className="ml-4 flex gap-2">
            <button
              onClick={() => goTo((current - 1 + SLIDES.length) % SLIDES.length)}
              className="w-8 h-8 rounded-lg border border-brand-border text-muted-foreground hover:text-foreground hover:border-lime-500/50 transition-colors flex items-center justify-center text-sm"
              aria-label="Previous slide"
            >
              ‹
            </button>
            <button
              onClick={() => goTo((current + 1) % SLIDES.length)}
              className="w-8 h-8 rounded-lg border border-brand-border text-muted-foreground hover:text-foreground hover:border-lime-500/50 transition-colors flex items-center justify-center text-sm"
              aria-label="Next slide"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
