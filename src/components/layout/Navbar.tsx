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
  { href: "/sessions", label: "Sessions" },
  { href: "/sessions", label: "Booking" },
  { href: "/dashboard",label: "Dashboard" },
  { href: "/blog",     label: "Blog" },
  { href: "/contact",  label: "Contact" },
];

export function Navbar() {
  const [scrolled,        setScrolled]        = useState(false);
  const [mobileOpen,      setMobileOpen]      = useState(false);
  const [activeDropdown,  setActiveDropdown]  = useState<string | null>(null);
  const pathname    = usePathname();
  const queryClient = useQueryClient();

  // useUser for React Query cache; useAuth for logout action
  const { data: user, isLoading: isUserLoading } = useUser();
  const { logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    setMobileOpen(false);
    // Clear React Query cache, then delegate to AuthContext.logout
    // which handles: authService.logout (server call + cookie cleanup),
    // React auth state reset, and redirect to /auth
    queryClient.setQueryData(["user-session"], null);
    queryClient.removeQueries({ queryKey: ["user-session"] });
    await logout();
  };

  // ── Auth section — shared between desktop & mobile ────────────────────
  const AuthSection = ({ mobile = false }: { mobile?: boolean }) => {
    if (isUserLoading) {
      return <div className="h-8 w-20 animate-pulse bg-brand-border rounded-lg" />;
    }

    if (user) {
      return mobile ? (
        <div className="flex flex-col gap-1 pt-2 border-t border-brand-border mt-2">
          <div className="px-4 py-2">
            <p className="text-xs text-muted-foreground">Signed in as</p>
            <p className="text-sm font-bold text-foreground truncate">{user.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-lime-500/10 text-lime-500 uppercase tracking-wider">
              {user.role}
            </span>
          </div>
          <Link
            href="/dashboard"
            className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-brand-card transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            My Dashboard
          </Link>
          <Link
            href="/profile/settings"
            className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-brand-card transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Settings
          </Link>
          <button
            onClick={handleLogout}
            className="text-left px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          >
            Log Out
          </button>
        </div>
      ) : (
        <UserMenu user={user} />
      );
    }

    // Not logged in
    return mobile ? (
      <div className="flex flex-col gap-2 pt-2 border-t border-brand-border mt-2">
        <Link
          href="/auth"
          className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-brand-card transition-colors"
          onClick={() => setMobileOpen(false)}
        >
          Sign In
        </Link>
        <Link
          href="/auth?tab=register"
          className="mx-4 bg-lime-500 text-brand-dark font-display font-bold text-sm px-5 py-3 rounded-lg hover:bg-lime-400 transition-all text-center tracking-wide"
          onClick={() => setMobileOpen(false)}
        >
          JOIN NOW
        </Link>
      </div>
    ) : (
      <>
        <Link
          href="/auth"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
        >
          Sign In
        </Link>
        <Link
          href="/auth?tab=register"
          className="bg-lime-500 text-brand-dark font-display font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-lime-400 transition-all duration-200 active:scale-95 tracking-wide"
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
        scrolled
          ? "bg-brand-dark/95 backdrop-blur-xl border-b border-brand-border shadow-xl shadow-black/20"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 font-display text-2xl font-black tracking-tight">
            <span className="text-foreground">SPORT</span>
            <span className="text-lime-500">PULSE</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => setActiveDropdown(link.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    pathname === link.href
                      ? "text-lime-500 bg-lime-500/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-brand-card"
                  )}
                >
                  {link.label}
                </Link>
              </div>
            ))}
          </div>

          {/* Desktop Auth */}
          <div className="hidden lg:flex items-center gap-3">
            <AuthSection />
          </div>

          {/* Mobile: compact avatar + hamburger */}
          <div className="lg:hidden flex items-center gap-2">
            {!isUserLoading && user && (
              <div className="w-8 h-8 rounded-full bg-lime-500 flex items-center justify-center text-brand-dark font-bold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <button
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-brand-card transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <div className="w-5 flex flex-col gap-1.5">
                <span className={cn("h-0.5 bg-current transition-all", mobileOpen && "rotate-45 translate-y-2")} />
                <span className={cn("h-0.5 bg-current transition-all", mobileOpen && "opacity-0")} />
                <span className={cn("h-0.5 bg-current transition-all", mobileOpen && "-rotate-45 -translate-y-2")} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "lg:hidden border-t border-brand-border bg-brand-dark/98 backdrop-blur-xl overflow-hidden transition-all duration-300",
          mobileOpen ? "max-h-screen pb-4" : "max-h-0"
        )}
      >
        <div className="px-4 pt-4 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                "px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                pathname === link.href
                  ? "text-lime-500 bg-lime-500/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-brand-card"
              )}
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
