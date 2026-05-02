"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

type Tab = "login" | "register";
type RoleOption = "user" | "coach" | "trainer";

const ROLE_MAP: Record<string, string> = {
  user: "MEMBER",
  coach: "COACH",
  trainer: "TRAINER",
};

export default function AuthClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoading: isUserLoading, login, register } = useAuth();

  const [tab, setTab] = useState<Tab>(
    searchParams.get("tab") === "register" ? "register" : "login",
  );

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [regData, setRegData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "user" as RoleOption,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Already logged in → redirect to dashboard
  useEffect(() => {
    if (!isUserLoading && user) {
      router.replace("/");
    }
  }, [user, isUserLoading, router]);

  // ── Login ──────────────────────────────────────────────────────
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(loginData.email, loginData.password);
      // login() calls router.push() internally — navigation may throw a
      // Next.js cancel signal; treat that as success not an error.
      setSuccess(true);
    } catch (err: any) {
      // Next.js router.push throws a special NEXT_REDIRECT / navigation error —
      // these are not real errors, ignore them.
      const msg = err?.response?.data?.message || err?.message || "";
      if (!msg || msg.includes("NEXT_") || msg.includes("navigation") || msg.includes("redirect")) {
        setSuccess(true);
        return;
      }
      setError(msg || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Register ───────────────────────────────────────────────────
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register(
        regData.name,
        regData.email,
        regData.password,
        regData.phone,
        ROLE_MAP[regData.role],
      );
      setSuccess(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "";
      if (!msg || msg.includes("NEXT_") || msg.includes("navigation") || msg.includes("redirect")) {
        setSuccess(true);
        return;
      }
      setError(msg || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl px-4 py-3 text-sm outline-none transition-all " +
    "bg-[#1c2f17] border border-[#2a3d22] text-[#f0f7ec] placeholder-[#4a6b40] " +
    "focus:border-[#9AD872] focus:ring-1 focus:ring-[#9AD872]/30";

  const labelClass =
    "block text-xs font-bold mb-2 uppercase tracking-wider text-[#7a9c6e]";

  return (
    <div className="min-h-screen pt-16 grid lg:grid-cols-2">

      {/* ── Left decoration panel ─────────────────────────────── */}
      <div
        className="relative hidden lg:flex flex-col justify-center px-14 py-20 overflow-hidden"
        style={{ background: "#0f1a0d", borderRight: "1px solid #2a3d22" }}
      >
        {/* Gradient blob */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 30% 55%, rgba(70,132,50,0.18) 0%, transparent 65%), " +
              "radial-gradient(ellipse 40% 35% at 80% 20%, rgba(154,216,114,0.08) 0%, transparent 55%)",
          }}
        />

        {/* Dot grid texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle, #468432 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative max-w-sm">
          {/* Badge */}
          <span
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-8"
            style={{
              background: "rgba(154,216,114,0.12)",
              border: "1px solid rgba(154,216,114,0.35)",
              color: "#9AD872",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "#9AD872" }}
            />
            JOIN TODAY
          </span>

          <h2
            className="font-display font-bold leading-[0.9] mb-6"
            style={{ fontSize: "clamp(48px,6vw,72px)", color: "#f0f7ec" }}
          >
            UNLOCK YOUR
            <br />
            <span style={{ color: "#9AD872" }}>POTENTIAL</span>
          </h2>

          <p className="text-sm leading-relaxed mb-10" style={{ color: "#7a9c6e" }}>
            Access elite training programs, track your fitness journey, and
            connect with top coaches across Bangladesh.
          </p>

          {/* Feature list */}
          <div className="flex flex-col gap-4">
            {[
              { icon: "🏆", text: "Free 7-day trial for all new members" },
              { icon: "⚡", text: "Book sessions in under 60 seconds" },
              { icon: "📊", text: "Real-time progress tracking" },
              { icon: "🎯", text: "Access to 48+ certified coaches" },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3 text-sm">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                  style={{
                    background: "rgba(70,132,50,0.2)",
                    border: "1px solid rgba(70,132,50,0.4)",
                  }}
                >
                  {f.icon}
                </div>
                <span style={{ color: "#7a9c6e" }}>{f.text}</span>
              </div>
            ))}
          </div>

          {/* Stats strip */}
          <div
            className="flex gap-6 mt-12 pt-8"
            style={{ borderTop: "1px solid #2a3d22" }}
          >
            {[
              { num: "2,400+", label: "Members" },
              { num: "48", label: "Coaches" },
              { num: "12", label: "Sports" },
            ].map((s) => (
              <div key={s.label}>
                <div
                  className="font-display font-bold text-2xl"
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
      </div>

      {/* ── Right form panel ──────────────────────────────────── */}
      <div
        className="flex items-center justify-center px-4 py-12"
        style={{ background: "#0f1a0d" }}
      >
        <div className="w-full max-w-md">

          {success ? (
            /* Success state */
            <div className="text-center animate-in fade-in zoom-in duration-300">
              <div className="text-6xl mb-5">🎉</div>
              <h2
                className="font-display font-bold text-4xl mb-3"
                style={{ color: "#f0f7ec" }}
              >
                Welcome to SportPulse!
              </h2>
              <p className="text-sm mb-8" style={{ color: "#7a9c6e" }}>
                Your account is ready. Time to start training.
              </p>
              <button
                onClick={() => router.push("/dashboard")}
                className="block w-full font-display font-bold py-4 rounded-xl text-center tracking-wide transition-all hover:brightness-110 active:scale-95"
                style={{ background: "#9AD872", color: "#0f1a0d", fontSize: "1rem" }}
              >
                GO TO DASHBOARD
              </button>
            </div>
          ) : (
            <>
              {/* Logo mark (mobile only) */}
              <div className="lg:hidden text-center mb-8">
                <span
                  className="font-display font-bold text-3xl tracking-tight"
                  style={{ color: "#f0f7ec" }}
                >
                  SPORT<span style={{ color: "#9AD872" }}>PULSE</span>
                </span>
              </div>

              {/* Tab switcher */}
              <div
                className="flex rounded-xl p-1 mb-7"
                style={{ background: "#162513", border: "1px solid #2a3d22" }}
              >
                {(["login", "register"] as Tab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTab(t); setError(null); }}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all"
                    style={
                      tab === t
                        ? {
                            background: "#1c2f17",
                            border: "1px solid #468432",
                            color: "#9AD872",
                          }
                        : { color: "#7a9c6e" }
                    }
                  >
                    {t === "login" ? "Sign In" : "Register"}
                  </button>
                ))}
              </div>

              {/* Error banner */}
              {error && (
                <div
                  className="mb-5 p-3 rounded-lg text-xs text-center"
                  style={{
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    color: "#f87171",
                  }}
                >
                  {error}
                </div>
              )}

              {/* Divider */}
              <div
                className="flex items-center gap-3 mb-5 text-xs uppercase tracking-wider"
                style={{ color: "#4a6b40" }}
              >
                <div className="flex-1 h-px" style={{ background: "#2a3d22" }} />
                <span>sign in with email</span>
                <div className="flex-1 h-px" style={{ background: "#2a3d22" }} />
              </div>

              {/* ── LOGIN FORM ─────────────────────────────────── */}
              {tab === "login" && (
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                  <div>
                    <label className={labelClass}>Email</label>
                    <input
                      type="email"
                      required
                      value={loginData.email}
                      onChange={(e) =>
                        setLoginData({ ...loginData, email: e.target.value })
                      }
                      placeholder="your@email.com"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Password</label>
                    <input
                      type="password"
                      required
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData({ ...loginData, password: e.target.value })
                      }
                      placeholder="••••••••"
                      className={inputClass}
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <label
                      className="flex items-center gap-2 cursor-pointer"
                      style={{ color: "#7a9c6e" }}
                    >
                      <input
                        type="checkbox"
                        checked={loginData.rememberMe}
                        onChange={(e) =>
                          setLoginData({ ...loginData, rememberMe: e.target.checked })
                        }
                        style={{ accentColor: "#9AD872" }}
                      />
                      Remember me
                    </label>
                    <Link
                      href="/auth/forgot-password"
                      className="hover:underline transition-colors"
                      style={{ color: "#FFA02E" }}
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full font-display font-bold py-4 rounded-xl tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    style={{
                      background: loading ? "#468432" : "#9AD872",
                      color: "#0f1a0d",
                      fontSize: "0.95rem",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {loading ? "SIGNING IN…" : "SIGN IN"}
                  </button>

                  <p className="text-xs text-center" style={{ color: "#4a6b40" }}>
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => { setTab("register"); setError(null); }}
                      className="font-bold hover:underline"
                      style={{ color: "#9AD872" }}
                    >
                      Register here
                    </button>
                  </p>
                </form>
              )}

              {/* ── REGISTER FORM ──────────────────────────────── */}
              {tab === "register" && (
                <form onSubmit={handleRegister} className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={regData.name}
                        onChange={(e) =>
                          setRegData({ ...regData, name: e.target.value })
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Phone</label>
                      <input
                        type="tel"
                        placeholder="+880"
                        value={regData.phone}
                        onChange={(e) =>
                          setRegData({ ...regData, phone: e.target.value })
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Email</label>
                    <input
                      type="email"
                      required
                      placeholder="your@email.com"
                      value={regData.email}
                      onChange={(e) =>
                        setRegData({ ...regData, email: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Password</label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      placeholder="Min. 8 characters"
                      value={regData.password}
                      onChange={(e) =>
                        setRegData({ ...regData, password: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>

                  {/* Role selector */}
                  <div>
                    <label className={labelClass}>I want to join as</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(
                        [
                          { value: "user", label: "Member", icon: "🏃" },
                          { value: "coach", label: "Coach", icon: "🧠" },
                          { value: "trainer", label: "Trainer", icon: "💪" },
                        ] as { value: RoleOption; label: string; icon: string }[]
                      ).map((r) => (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() =>
                            setRegData({ ...regData, role: r.value })
                          }
                          className="flex flex-col items-center gap-1 py-3 rounded-xl text-xs font-bold transition-all"
                          style={
                            regData.role === r.value
                              ? {
                                  background: "rgba(154,216,114,0.15)",
                                  border: "1px solid #9AD872",
                                  color: "#9AD872",
                                }
                              : {
                                  background: "#1c2f17",
                                  border: "1px solid #2a3d22",
                                  color: "#7a9c6e",
                                }
                          }
                        >
                          <span className="text-lg">{r.icon}</span>
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full font-display font-bold py-4 rounded-xl tracking-widest transition-all active:scale-95 disabled:opacity-50 mt-2"
                    style={{
                      background: loading ? "#468432" : "#9AD872",
                      color: "#0f1a0d",
                      fontSize: "0.95rem",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {loading ? "CREATING ACCOUNT…" : "CREATE ACCOUNT"}
                  </button>

                  <p className="text-xs text-center" style={{ color: "#4a6b40" }}>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => { setTab("login"); setError(null); }}
                      className="font-bold hover:underline"
                      style={{ color: "#9AD872" }}
                    >
                      Sign in
                    </button>
                  </p>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
