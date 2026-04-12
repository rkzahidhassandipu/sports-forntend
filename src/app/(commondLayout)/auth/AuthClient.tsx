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
  admin: "ADMIN",
  receptionist: "RECEPTIONIST",
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

  // Already logged in হলে redirect
  useEffect(() => {
    if (!isUserLoading && user) {
      router.replace("/");
    }
  }, [user, isUserLoading, router]);

  // Login handler
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(loginData.email, loginData.password);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  // Register handler
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
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen pt-16 grid lg:grid-cols-2">
      {/* Left Decoration Side */}
      <div
        className="relative hidden lg:flex flex-col justify-center px-12 py-16 overflow-hidden"
        style={{
          background: "hsl(220 22% 10%)",
          borderRight: "1px solid hsl(220 18% 18%)",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 30% 60%, hsla(75,100%,60%,0.08) 0%, transparent 60%)",
          }}
        />
        <div className="relative max-w-md">
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-6"
            style={{
              background: "hsla(75,100%,55%,0.1)",
              border: "1px solid hsla(75,100%,55%,0.3)",
              color: "hsl(75 100% 55%)",
            }}
          >
            JOIN TODAY
          </span>
          <h2 className="font-display font-black text-5xl leading-tight mb-5 text-white">
            UNLOCK YOUR
            <br />
            <span style={{ color: "hsl(75 100% 55%)" }}>POTENTIAL</span>
          </h2>
          <p
            style={{ color: "hsl(220 12% 60%)" }}
            className="leading-relaxed mb-8 text-sm"
          >
            Access elite training programs, track your fitness journey, and
            connect with top coaches.
          </p>
          <div className="flex flex-col gap-3">
            {[
              "Free 7-day trial for all members",
              "Book sessions in under 60 seconds",
              "Real-time progress tracking",
              "Access to 48+ certified coaches",
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-3 text-sm">
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0"
                  style={{
                    background: "hsla(174,85%,50%,0.15)",
                    border: "1px solid hsla(174,85%,50%,0.3)",
                    color: "hsl(174 85% 50%)",
                  }}
                >
                  ✓
                </div>
                <span style={{ color: "hsl(220 12% 60%)" }}>{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {success ? (
            <div className="text-center animate-in fade-in zoom-in duration-300">
              <div className="text-6xl mb-5">🎉</div>
              <h2 className="font-display font-black text-4xl mb-3 text-white">
                Welcome to SportPulse!
              </h2>
              <p className="text-sm mb-6" style={{ color: "hsl(220 12% 60%)" }}>
                Your account is ready. Time to start training.
              </p>
              <button
                onClick={() => router.push("/dashboard")}
                className="block w-full font-display font-bold py-4 rounded-xl text-center tracking-wide transition-all hover:brightness-110 active:scale-95"
                style={{
                  background: "hsl(75 100% 55%)",
                  color: "hsl(220 25% 6%)",
                }}
              >
                GO TO DASHBOARD
              </button>
            </div>
          ) : (
            <>
              {/* Tab Switcher */}
              <div
                className="flex rounded-xl p-1 mb-7"
                style={{ background: "hsl(220 20% 13%)" }}
              >
                {(["login", "register"] as Tab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTab(t);
                      setError(null);
                    }}
                    className={cn(
                      "flex-1 py-2.5 rounded-lg text-sm font-medium capitalize transition-all",
                      tab === t
                        ? "text-white"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    style={
                      tab === t
                        ? {
                            background: "hsl(220 22% 10%)",
                            border: "1px solid hsl(220 18% 18%)",
                          }
                        : {}
                    }
                  >
                    {t === "login" ? "Sign In" : "Register"}
                  </button>
                ))}
              </div>

              {error && (
                <div className="mb-5 p-3 rounded-lg text-xs bg-red-500/10 border border-red-500/20 text-red-500 text-center">
                  {error}
                </div>
              )}

              {/* Social Login */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { icon: "🔵", label: "Google" },
                  { icon: "🔷", label: "Facebook" },
                ].map((s) => (
                  <button
                    key={s.label}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm transition-all hover:bg-white/5"
                    style={{
                      border: "1px solid hsl(220 18% 18%)",
                      background: "hsl(220 20% 13%)",
                      color: "hsl(220 12% 60%)",
                    }}
                  >
                    <span>{s.icon}</span> {s.label}
                  </button>
                ))}
              </div>

              <div
                className="flex items-center gap-3 mb-5 text-xs uppercase tracking-tighter"
                style={{ color: "hsl(220 12% 60%)" }}
              >
                <div
                  className="flex-1 h-px"
                  style={{ background: "hsl(220 18% 18%)" }}
                />
                <span>or continue with email</span>
                <div
                  className="flex-1 h-px"
                  style={{ background: "hsl(220 18% 18%)" }}
                />
              </div>

              {/* LOGIN FORM */}
              {tab === "login" && (
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                  <div>
                    <label
                      className="block text-xs font-bold mb-2 uppercase tracking-wide"
                      style={{ color: "hsl(220 12% 60%)" }}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={loginData.email}
                      onChange={(e) =>
                        setLoginData({ ...loginData, email: e.target.value })
                      }
                      placeholder="your@email.com"
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none bg-[#1a1d23] border border-[#2a2e37] text-white focus:border-[#4a4f5a] transition-all"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-xs font-bold mb-2 uppercase tracking-wide"
                      style={{ color: "hsl(220 12% 60%)" }}
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData({ ...loginData, password: e.target.value })
                      }
                      placeholder="••••••••"
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none bg-[#1a1d23] border border-[#2a2e37] text-white focus:border-[#4a4f5a] transition-all"
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <label
                      className="flex items-center gap-2 cursor-pointer"
                      style={{ color: "hsl(220 12% 60%)" }}
                    >
                      <input
                        type="checkbox"
                        checked={loginData.rememberMe}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            rememberMe: e.target.checked,
                          })
                        }
                        className="accent-[#d4ff00]"
                      />
                      Remember me
                    </label>
                    <Link
                      href="/auth/forgot-password"
                      style={{ color: "hsl(75 100% 55%)" }}
                      className="hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full font-display font-bold py-4 rounded-xl tracking-wide transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: "hsl(75 100% 55%)",
                      color: "hsl(220 25% 6%)",
                    }}
                  >
                    {loading ? "SIGNING IN..." : "SIGN IN"}
                  </button>
                </form>
              )}

              {/* REGISTER FORM */}
              {tab === "register" && (
                <form onSubmit={handleRegister} className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block text-xs font-bold mb-2 uppercase"
                        style={{ color: "hsl(220 12% 60%)" }}
                      >
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={regData.name}
                        onChange={(e) =>
                          setRegData({ ...regData, name: e.target.value })
                        }
                        className="w-full rounded-xl px-4 py-3 text-sm outline-none bg-[#1a1d23] border border-[#2a2e37] text-white"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-xs font-bold mb-2 uppercase"
                        style={{ color: "hsl(220 12% 60%)" }}
                      >
                        Phone
                      </label>
                      <input
                        type="tel"
                        placeholder="+880"
                        value={regData.phone}
                        onChange={(e) =>
                          setRegData({ ...regData, phone: e.target.value })
                        }
                        className="w-full rounded-xl px-4 py-3 text-sm outline-none bg-[#1a1d23] border border-[#2a2e37] text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      className="block text-xs font-bold mb-2 uppercase"
                      style={{ color: "hsl(220 12% 60%)" }}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="your@email.com"
                      value={regData.email}
                      onChange={(e) =>
                        setRegData({ ...regData, email: e.target.value })
                      }
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none bg-[#1a1d23] border border-[#2a2e37] text-white"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-xs font-bold mb-2 uppercase"
                      style={{ color: "hsl(220 12% 60%)" }}
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Min. 8 characters"
                      value={regData.password}
                      onChange={(e) =>
                        setRegData({ ...regData, password: e.target.value })
                      }
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none bg-[#1a1d23] border border-[#2a2e37] text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full font-display font-bold py-4 rounded-xl tracking-wide transition-all active:scale-95 disabled:opacity-50"
                    style={{
                      background: "hsl(75 100% 55%)",
                      color: "hsl(220 25% 6%)",
                    }}
                  >
                    {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}