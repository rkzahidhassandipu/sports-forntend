"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Role } from "@/types/enums";
import { authService } from "@/services/auth.service";

const NAV_DATA: Record<Role, { label: string; icon: string; href: string }[]> = {
  [Role.ADMIN]: [
    { label: "Overview",         icon: "📊", href: "/dashboard/admin" },
    { label: "Bookings",         icon: "📅", href: "/dashboard/admin/bookings" },
    { label: "Payments",         icon: "💳", href: "/dashboard/admin/payments" },
    { label: "Manage Sessions",  icon: "🏋️‍♂️", href: "/dashboard/admin/sessions" },
    { label: "Users & Roles",    icon: "👥", href: "/dashboard/admin/users" },
    { label: "Fitness Tracking", icon: "💪", href: "/dashboard/admin/fitness" },
    { label: "Support Tickets",  icon: "🎫", href: "/dashboard/admin/support" },
    { label: "Blog Posts",       icon: "✍️", href: "/dashboard/admin/blogs" },
    { label: "Contact",          icon: "✉️", href: "/dashboard/admin/contacts" },
    { label: "Audit Logs",       icon: "📜", href: "/dashboard/admin/audit" },
    { label: "Settings",         icon: "⚙️", href: "/dashboard/admin/settings" },
  ],
  [Role.TRAINER]: [
    { label: "My Sessions",     icon: "🏋️‍♂️", href: "/dashboard/trainer" },
    { label: "Client Progress", icon: "💪",   href: "/dashboard/trainer/clients" },
  ],
  [Role.COACH]: [
    { label: "Team Strategy", icon: "📋", href: "/dashboard/coach" },
    { label: "Performance",   icon: "📈", href: "/dashboard/coach/performance" },
  ],
  [Role.RECEPTIONIST]: [
    { label: "Check-in", icon: "🔑", href: "/dashboard/reception" },
    { label: "Bookings", icon: "📅", href: "/dashboard/reception/bookings" },
  ],
  [Role.MEMBER]: [
    { label: "My Dashboard", icon: "🏠", href: "/dashboard/member" },
    { label: "Blogs",        icon: "✍️", href: "/dashboard/member/blog" },
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

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export function Sidebar() {
  const [isOpen, setIsOpen]   = useState(false);
  const [user, setUser]       = useState<AuthUser | null>(null);
  const pathname              = usePathname();
  const router                = useRouter();

  const role     = user?.role as Role | undefined;
  const navItems = role ? (NAV_DATA[role] ?? []) : [];
  const section  = role ? ROLE_LABELS[role] : "";

  // ── app load এ getMe দিয়ে user fetch ──
  useEffect(() => {
    authService.getMe()
      .then((res) => {
        // response: { data: { user: {...} } } বা { data: {...} }
        const u = res?.data?.user ?? res?.data ?? null;
        console.log("SIDEBAR USER:", u);
        setUser(u);
      })
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

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
    router.push("/login");
  };

  return (
    <>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-slate-950 border border-slate-800 rounded-xl shadow-xl text-lime-400 active:scale-95 transition-all"
        aria-label="Toggle sidebar"
      >
        <span className="text-xl font-bold">{isOpen ? "✕" : "☰"}</span>
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-[280px] bg-[#090c14] border-r border-slate-800/60",
          "transform transition-all duration-300 ease-in-out overflow-y-auto scrollbar-hide",
          "lg:relative lg:translate-x-0",
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        )}
      >
        <div className="h-full flex flex-col pt-8 pb-6 px-4">

          <Link href="/" className="flex items-center gap-3 px-3 mb-10 group">
            <div className="w-8 h-8 bg-lime-500 rounded-lg flex items-center justify-center font-black text-slate-950 text-sm group-hover:rotate-12 transition-transform">
              SP
            </div>
            <span className="text-lg font-bold tracking-tight text-white uppercase">
              Sport<span className="text-lime-500">Pulse</span>
            </span>
          </Link>

          <nav className="flex-1 space-y-1">
            {section && (
              <h4 className="px-4 mb-3 text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">
                {section}
              </h4>
            )}

            <div className="space-y-1">
              {navItems.length > 0 ? (
                navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all group",
                      isActive(item.href)
                        ? "bg-lime-500 text-slate-950 shadow-[0_10px_20px_-5px_rgba(132,204,22,0.3)]"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/50",
                    )}
                  >
                    <span
                      className={cn(
                        "text-base transition-transform",
                        isActive(item.href)
                          ? "scale-110"
                          : "group-hover:scale-110 group-hover:rotate-6",
                      )}
                    >
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.label}</span>
                  </Link>
                ))
              ) : (
                <p className="px-4 py-3 text-xs text-slate-600 italic">
                  Loading navigation…
                </p>
              )}
            </div>
          </nav>

          <div className="mt-8 pt-6 border-t border-slate-800/60 space-y-3">
            {user && (
              <div className="px-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-lime-400 shrink-0">
                  {user.name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-500 truncate capitalize">{role?.toLowerCase()}</p>
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all"
            >
              <span className="text-lg">🚪</span>
              <span>Sign Out</span>
            </button>
          </div>

        </div>
      </aside>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
        />
      )}
    </>
  );
}