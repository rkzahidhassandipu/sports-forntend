"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/hooks/useUser";
import { UserMenu } from "./UserMenu";

const NAV_LINKS = [
  { href: "/",         label: "Home" },
  { href: "/sessions", label: "Booking" },
  { href: "/blog",     label: "Blog" },
  { href: "/contact",  label: "Contact" },
];

export function Navbar() {
  const [scrolled,       setScrolled]       = useState(false);
  const [mobileOpen,     setMobileOpen]     = useState(false);
  const pathname    = usePathname();
  const queryClient = useQueryClient();

  const { data: user, isLoading: isUserLoading } = useUser();
  const { logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    setMobileOpen(false);
    queryClient.setQueryData(["user-session"], null);
    queryClient.removeQueries({ queryKey: ["user-session"] });
    await logout();
  };

  const AuthSection = ({ mobile = false }: { mobile?: boolean }) => {
    if (isUserLoading) {
      return (
        <div
          className="h-8 w-20 animate-pulse rounded-lg"
          style={{ background: "#2a3d22" }}
        />
      );
    }

    if (user) {
      return mobile ? (
        <div
          className="flex flex-col gap-1 pt-3 mt-3"
          style={{ borderTop: "1px solid #2a3d22" }}
        >
          <div className="px-4 py-2">
            <p className="text-xs" style={{ color: "#4a6b40" }}>Signed in as</p>
            <p className="text-sm font-bold truncate" style={{ color: "#f0f7ec" }}>
              {user.email}
            </p>
            <span
              className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
              style={{ background: "rgba(154,216,114,0.12)", color: "#9AD872" }}
            >
              {user.role}
            </span>
          </div>
          <Link
            href="/dashboard"
            className="px-4 py-3 rounded-lg text-sm font-medium transition-colors"
            style={{ color: "#7a9c6e" }}
            onClick={() => setMobileOpen(false)}
          >
            My Dashboard
          </Link>
          <button
            onClick={handleLogout}
            className="text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors"
            style={{ color: "#f87171" }}
          >
            Log Out
          </button>
        </div>
      ) : (
        <UserMenu user={user} />
      );
    }

    return mobile ? (
      <div
        className="flex flex-col gap-2 pt-3 mt-3"
        style={{ borderTop: "1px solid #2a3d22" }}
      >
        <Link
          href="/auth"
          className="px-4 py-3 rounded-lg text-sm font-medium transition-colors"
          style={{ color: "#7a9c6e" }}
          onClick={() => setMobileOpen(false)}
        >
          Sign In
        </Link>
        <Link
          href="/auth?tab=register"
          className="mx-4 font-display font-bold text-sm px-5 py-3 rounded-xl transition-all text-center tracking-widest"
          style={{ background: "#9AD872", color: "#0f1a0d" }}
          onClick={() => setMobileOpen(false)}
        >
          JOIN NOW
        </Link>
      </div>
    ) : (
      <>
        <Link
          href="/auth"
          className="text-sm px-3 py-2 transition-colors"
          style={{ color: "#7a9c6e" }}
        >
          Sign In
        </Link>
        <Link
          href="/auth?tab=register"
          className="font-display font-bold text-sm px-5 py-2.5 rounded-xl transition-all duration-200 active:scale-95 tracking-widest"
          style={{ background: "#9AD872", color: "#0f1a0d" }}
        >
          JOIN NOW
        </Link>
      </>
    );
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "backdrop-blur-xl shadow-xl shadow-black/30" : "bg-transparent",
      )}
      style={scrolled ? { background: "rgba(15,26,13,0.95)", borderBottom: "1px solid #2a3d22" } : {}}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-0.5 font-display font-bold text-2xl tracking-tight"
            style={{ letterSpacing: "0.04em" }}
          >
            <span style={{ color: "#f0f7ec" }}>SPORT</span>
            <span style={{ color: "#9AD872" }}>PULSE</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
                )}
                style={
                  pathname === link.href
                    ? {
                        background: "rgba(154,216,114,0.12)",
                        color: "#9AD872",
                        border: "1px solid rgba(154,216,114,0.25)",
                      }
                    : { color: "#7a9c6e" }
                }
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth */}
          <div className="hidden lg:flex items-center gap-3">
            <AuthSection />
          </div>

          {/* Mobile: avatar + hamburger */}
          <div className="lg:hidden flex items-center gap-2">
            {!isUserLoading && user && (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                style={{ background: "#9AD872", color: "#0f1a0d" }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <button
              className="p-2 rounded-lg transition-colors"
              style={{ color: "#7a9c6e" }}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <div className="w-5 flex flex-col gap-1.5">
                <span
                  className={cn(
                    "h-0.5 bg-current transition-all duration-300",
                    mobileOpen && "rotate-45 translate-y-2",
                  )}
                />
                <span
                  className={cn(
                    "h-0.5 bg-current transition-all duration-300",
                    mobileOpen && "opacity-0",
                  )}
                />
                <span
                  className={cn(
                    "h-0.5 bg-current transition-all duration-300",
                    mobileOpen && "-rotate-45 -translate-y-2",
                  )}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "lg:hidden backdrop-blur-xl overflow-hidden transition-all duration-300",
          mobileOpen ? "max-h-screen pb-4" : "max-h-0",
        )}
        style={{
          borderTop: mobileOpen ? "1px solid #2a3d22" : "none",
          background: "rgba(15,26,13,0.98)",
        }}
      >
        <div className="px-4 pt-4 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="px-4 py-3 rounded-lg text-sm font-semibold transition-colors"
              style={
                pathname === link.href
                  ? { background: "rgba(154,216,114,0.1)", color: "#9AD872" }
                  : { color: "#7a9c6e" }
              }
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <AuthSection mobile />
        </div>
      </div>
    </nav>
  );
}
