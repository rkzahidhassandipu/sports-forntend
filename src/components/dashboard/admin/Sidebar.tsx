"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Role } from "@/types/enums";
import { getMeUser, AuthUser } from "@/context/AuthContext";
import { authService } from "@/services/auth.service";

// ── Brand colors ──────────────────────────────────────────────────────────────
const C = {
  bg: "#0f1a0d",
  mid: "#162513",
  surface: "#1c2f17",
  border: "#2a3d22",
  green: "#9AD872",
  forest: "#468432",
  yellow: "#FFEF91",
  orange: "#FFA02E",
  fg: "#f0f7ec",
  muted: "#7a9c6e",
  dimmed: "#4a6b40",
};

// ── Nav items per role ────────────────────────────────────────────────────────
const NAV_DATA: Record<Role, { label: string; icon: string; href: string }[]> = {
  [Role.ADMIN]: [
    { label: "Overview",      icon: "◈",  href: "/dashboard/admin" },
    { label: "Bookings",      icon: "📅", href: "/dashboard/admin/bookings" },
    { label: "Payments",      icon: "💳", href: "/dashboard/admin/payments" },
    { label: "Sessions",      icon: "🏋️", href: "/dashboard/admin/sessions" },
    { label: "Users & Roles", icon: "👥", href: "/dashboard/admin/users" },
    { label: "Fitness",       icon: "💪", href: "/dashboard/admin/fitness" },
    { label: "Support",       icon: "🎫", href: "/dashboard/admin/support" },
    { label: "Blog Posts",    icon: "✍️", href: "/dashboard/admin/blogs" },
    { label: "Newsletter",    icon: "✉️", href: "/dashboard/admin/newsletter" },
    { label: "Contacts",      icon: "📬", href: "/dashboard/admin/contacts" },
    { label: "Terms & Privacy",icon: "📜",href: "/dashboard/admin/terms" },
    { label: "Settings",      icon: "⚙️", href: "/dashboard/admin/profile" },
  ],
  [Role.TRAINER]: [
    { label: "My Sessions", icon: "🏋️", href: "/dashboard/trainer" },
    { label: "Profile",     icon: "👤", href: "/dashboard/trainer/profile" },
  ],
  [Role.COACH]: [
    { label: "Overview",  icon: "📋", href: "/dashboard/coach" },
    { label: "Profile",   icon: "👤", href: "/dashboard/coach/profile" },
    { label: "Blogs",     icon: "✍️", href: "/dashboard/coach/blogs" },
    { label: "Bookings",  icon: "📅", href: "/dashboard/coach/bookings" },
    { label: "Fitness",   icon: "💪", href: "/dashboard/coach/fitness" },
    { label: "Sessions",  icon: "🏋️", href: "/dashboard/coach/sessions" },
  ],
  [Role.RECEPTIONIST]: [
    { label: "Overview",  icon: "◈",  href: "/dashboard/reception" },
    { label: "Bookings",  icon: "📅", href: "/dashboard/reception/bookings" },
    { label: "Messages",  icon: "💬", href: "/dashboard/reception/messages" },
    { label: "Support",   icon: "🎫", href: "/dashboard/reception/support" },
    { label: "Profile",   icon: "👤", href: "/dashboard/reception/profile" },
  ],
  [Role.MEMBER]: [
    { label: "Dashboard", icon: "◈",  href: "/dashboard/member" },
    { label: "Bookings",  icon: "📅", href: "/dashboard/member/bookings" },
    { label: "Fitness",   icon: "💪", href: "/dashboard/member/fitness" },
    { label: "Blog",      icon: "✍️", href: "/dashboard/member/blog" },
    { label: "Support",   icon: "🎫", href: "/dashboard/member/support-center" },
    { label: "Profile",   icon: "👤", href: "/dashboard/member/profile" },
  ],
};

const ROLE_LABELS: Record<Role, string> = {
  [Role.ADMIN]:        "Administration",
  [Role.TRAINER]:      "Trainer Portal",
  [Role.COACH]:        "Coach Portal",
  [Role.RECEPTIONIST]: "Reception",
  [Role.MEMBER]:       "Member Area",
};

const ROOT_HREFS: Record<Role, string> = {
  [Role.ADMIN]:        "/dashboard/admin",
  [Role.TRAINER]:      "/dashboard/trainer",
  [Role.COACH]:        "/dashboard/coach",
  [Role.RECEPTIONIST]: "/dashboard/reception",
  [Role.MEMBER]:       "/dashboard/member",
};

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // ✅ TanStack Query — fetch & cache current user
  const { data: user, isLoading } = useQuery<AuthUser>({
    queryKey: ["me"],
    queryFn: getMeUser,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 min cache
  });

  const role = user?.role?.toUpperCase() as Role | undefined;
  const navItems = role ? (NAV_DATA[role] ?? []) : [];
  const section  = role ? ROLE_LABELS[role] : "";

  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (!role) return false;
    if (href === ROOT_HREFS[role]) return pathname === href;
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await authService.logout();
    router.push("/auth");
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen((p) => !p)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl shadow-xl active:scale-95 transition-all"
        style={{
          background: C.mid,
          border: `1px solid ${C.border}`,
          color: C.green,
        }}
        aria-label="Toggle sidebar"
      >
        <span className="text-lg font-bold leading-none">
          {isOpen ? "✕" : "☰"}
        </span>
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-[260px]",
          "transform transition-all duration-300 ease-in-out overflow-y-auto",
          "lg:relative lg:translate-x-0",
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        )}
        style={{ background: C.bg, borderRight: `1px solid ${C.border}` }}
      >
        <div className="h-full flex flex-col pt-6 pb-6 px-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 px-3 mb-8 group">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm transition-transform group-hover:rotate-12"
              style={{ background: C.green, color: C.bg }}
            >
              SP
            </div>
            <span
              className="text-lg font-display font-bold tracking-tight uppercase"
              style={{ color: C.fg }}
            >
              Sport<span style={{ color: C.green }}>Pulse</span>
            </span>
          </Link>

          {/* Nav */}
          <nav className="flex-1 space-y-0.5">
            {section && (
              <p
                className="px-3 mb-3 text-[9px] font-bold uppercase tracking-[0.2em]"
                style={{ color: C.dimmed }}
              >
                {section}
              </p>
            )}

            {isLoading ? (
              <div className="space-y-1 px-1">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-9 rounded-xl animate-pulse"
                    style={{ background: C.surface }}
                  />
                ))}
              </div>
            ) : navItems.length > 0 ? (
              navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all",
                      active
                        ? "bg-[#9AD872] text-[#0f1a0d]"
                        : "text-[#7a9c6e] hover:bg-[#1c2f17] hover:text-[#f0f7ec]",
                    )}
                  >
                    <span className="text-base w-5 text-center shrink-0">
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.label}</span>
                    {active && (
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: C.bg }}
                      />
                    )}
                  </Link>
                );
              })
            ) : (
              <p
                className="px-3 py-3 text-xs italic"
                style={{ color: C.dimmed }}
              >
                No navigation available
              </p>
            )}
          </nav>

          {/* User footer */}
          <div
            className="mt-6 pt-4 space-y-2"
            style={{ borderTop: `1px solid ${C.border}` }}
          >
            {user && (
              <div className="px-3 flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    color: C.green,
                  }}
                >
                  {user.name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="min-w-0">
                  <p
                    className="text-xs font-semibold truncate"
                    style={{ color: C.fg }}
                  >
                    {user.name}
                  </p>
                  <p
                    className="text-[10px] capitalize"
                    style={{ color: C.dimmed }}
                  >
                    {role?.toLowerCase()}
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ color: "#f87171" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(239,68,68,0.08)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "transparent";
              }}
            >
              <span className="text-base">🚪</span>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
        />
      )}
    </>
  );
}