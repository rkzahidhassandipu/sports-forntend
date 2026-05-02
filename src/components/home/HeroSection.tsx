"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const SLIDES = [
  {
    badge: "BANGLADESH'S PREMIER SPORTS CLUB",
    headline: ["TRAIN.", "COMPETE.", "DOMINATE."],
    accentLine: 1,
    sub: "World-class coaching, state-of-the-art facilities, and expert trainers — all in one platform. Book sessions, track fitness, and reach your peak performance.",
    cta: {
      primary:   { label: "EXPLORE SESSIONS", href: "/sessions" },
      secondary: { label: "JOIN FREE",        href: "/auth?tab=register" },
    },
    stat: [
      { num: "2,400+", label: "Active Members" },
      { num: "48",     label: "Expert Coaches" },
      { num: "12",     label: "Sports Available" },
    ],
  },
  {
    badge: "ELITE COACHING PROGRAMS",
    headline: ["BUILD.", "PERFORM.", "WIN."],
    accentLine: 2,
    sub: "From football to swimming, boxing to gymnastics — 12 sports programs with certified national coaches guiding every step of your journey.",
    cta: {
      primary:   { label: "VIEW PROGRAMS", href: "/sessions" },
      secondary: { label: "LEARN MORE",   href: "/about" },
    },
    stat: [
      { num: "98%",  label: "Satisfaction Rate" },
      { num: "6+",   label: "Years Running" },
      { num: "340+", label: "Daily Bookings" },
    ],
  },
  {
    badge: "7-DAY FREE TRIAL",
    headline: ["START YOUR", "FITNESS", "JOURNEY."],
    accentLine: 1,
    sub: "New members get 7 days of unlimited access — completely free. No credit card required. Join thousands already transforming their performance.",
    cta: {
      primary:   { label: "START FREE TRIAL", href: "/auth?tab=register" },
      secondary: { label: "SEE OFFERS",       href: "/sessions#offers" },
    },
    stat: [
      { num: "৳0",     label: "First Week Cost" },
      { num: "7 Days", label: "Free Access" },
      { num: "No Card",label: "Required" },
    ],
  },
];

const SPORT_GRID = [
  { icon: "⚽", name: "Football",   hot: true },
  { icon: "🏀", name: "Basketball", hot: false },
  { icon: "🎾", name: "Tennis",     hot: false },
  { icon: "🏊", name: "Swimming",   hot: true },
  { icon: "🥊", name: "Boxing",     hot: false },
  { icon: "🏋️", name: "Fitness",   hot: true },
];

export function HeroSection() {
  const [current,     setCurrent]     = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => goTo((current + 1) % SLIDES.length), 5500);
    return () => clearInterval(timer);
  }, [current]);

  function goTo(idx: number) {
    setIsAnimating(true);
    setTimeout(() => { setCurrent(idx); setIsAnimating(false); }, 220);
  }

  const slide = SLIDES[current];

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden pt-16"
      style={{ background: "#0f1a0d" }}
    >
      {/* BG gradient blobs */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 75% 45%, rgba(70,132,50,0.14) 0%, transparent 60%), " +
            "radial-gradient(ellipse 45% 40% at 12% 75%, rgba(255,160,46,0.07) 0%, transparent 55%)",
        }}
      />
      {/* Grid texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(42,61,34,0.35) 1px, transparent 1px), " +
            "linear-gradient(90deg, rgba(42,61,34,0.35) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* ── Content ─────────────────────────────────────────── */}
          <div
            className={cn(
              "transition-all duration-300",
              isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0",
            )}
          >
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-7"
              style={{
                background: "rgba(255,239,145,0.1)",
                border:     "1px solid rgba(255,239,145,0.3)",
                color:      "#FFEF91",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: "#FFEF91" }}
              />
              {slide.badge}
            </div>

            {/* Headline */}
            <h1
              className="font-display font-bold leading-[0.9] tracking-tight mb-6"
              style={{ fontSize: "clamp(52px,8vw,96px)" }}
            >
              {slide.headline.map((line, i) => (
                <span
                  key={i}
                  className="block"
                  style={{
                    color: i === slide.accentLine ? "#9AD872" : "#f0f7ec",
                  }}
                >
                  {line}
                </span>
              ))}
            </h1>

            <p
              className="text-base leading-relaxed max-w-xl mb-9"
              style={{ color: "#7a9c6e" }}
            >
              {slide.sub}
            </p>

            {/* CTAs */}
            <div className="flex gap-3 flex-wrap mb-12">
              <Link
                href={slide.cta.primary.href}
                className="font-display font-bold px-7 py-3.5 rounded-xl transition-all duration-200 active:scale-95 tracking-widest text-base"
                style={{ background: "#9AD872", color: "#0f1a0d" }}
              >
                {slide.cta.primary.label}
              </Link>
              <Link
                href={slide.cta.secondary.href}
                className="font-display font-bold px-7 py-3.5 rounded-xl transition-all duration-200 tracking-widest text-base"
                style={{
                  border: "1px solid #2a3d22",
                  color:  "#7a9c6e",
                }}
              >
                {slide.cta.secondary.label}
              </Link>
            </div>

            {/* Stats */}
            <div
              className="flex gap-8 pt-6 flex-wrap"
              style={{ borderTop: "1px solid #2a3d22" }}
            >
              {slide.stat.map((s) => (
                <div key={s.label}>
                  <div
                    className="font-display font-bold text-3xl leading-tight"
                    style={{ color: "#FFA02E" }}
                  >
                    {s.num}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "#4a6b40" }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Sport grid ──────────────────────────────────────── */}
          <div className="hidden lg:grid grid-cols-2 gap-3">
            {SPORT_GRID.map((sport, i) => (
              <Link
                key={sport.name}
                href={`/sessions?sport=${sport.name.toLowerCase()}`}
                className="group relative flex flex-col items-center justify-center p-6 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl text-center"
                style={{
                  background: sport.hot
                    ? "linear-gradient(135deg, rgba(70,132,50,0.18) 0%, rgba(154,216,114,0.08) 100%)"
                    : "#162513",
                  border: sport.hot ? "1px solid rgba(154,216,114,0.3)" : "1px solid #2a3d22",
                  animationDelay: `${i * 80}ms`,
                }}
              >
                <span className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200 block">
                  {sport.icon}
                </span>
                <span
                  className="text-sm font-semibold transition-colors duration-200"
                  style={{ color: "#7a9c6e" }}
                >
                  {sport.name}
                </span>
                {sport.hot && (
                  <span
                    className="absolute top-2.5 right-2.5 text-[9px] font-black px-1.5 py-0.5 rounded-full tracking-wider"
                    style={{ background: "#FFA02E", color: "#0f1a0d" }}
                  >
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
              className="rounded-full transition-all duration-300"
              style={
                i === current
                  ? { width: 32, height: 8, background: "#9AD872" }
                  : { width: 8, height: 8, background: "#2a3d22" }
              }
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
          <div className="ml-4 flex gap-2">
            <button
              onClick={() => goTo((current - 1 + SLIDES.length) % SLIDES.length)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all"
              style={{
                border: "1px solid #2a3d22",
                color: "#7a9c6e",
                background: "transparent",
              }}
              aria-label="Previous slide"
            >
              ‹
            </button>
            <button
              onClick={() => goTo((current + 1) % SLIDES.length)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all"
              style={{
                border: "1px solid #2a3d22",
                color: "#7a9c6e",
                background: "transparent",
              }}
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
