"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

interface UserMenuProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
}

const DASHBOARD_ROUTES: Record<string, string> = {
  ADMIN:        "/dashboard/admin",
  TRAINER:      "/dashboard/trainer",
  COACH:        "/dashboard/coach",
  RECEPTIONIST: "/dashboard/reception",
  MEMBER:       "/dashboard/member",
};

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { logout } = useAuth();

  // ─── Hooks must come before any early return ───────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Safe guard after hooks
  if (!user) return null;

  const dashHref = DASHBOARD_ROUTES[user.role?.toUpperCase()] ?? "/dashboard";
  const initial  = user.name?.charAt(0)?.toUpperCase() ?? "?";

  const handleLogout = async () => {
    setIsOpen(false);
    queryClient.setQueryData(["user-session"], null);
    queryClient.removeQueries({ queryKey: ["user-session"] });
    await logout();
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      {/* Avatar button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 sm:pr-3 rounded-full transition-all duration-200 shrink-0"
        style={{
          background: "#162513",
          border: isOpen ? "1px solid #9AD872" : "1px solid #2a3d22",
          boxShadow: isOpen ? "0 0 0 3px rgba(154,216,114,0.12)" : "none",
        }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
          style={{ background: "#9AD872", color: "#0f1a0d" }}
        >
          {initial}
        </div>
        <span
          className="hidden sm:inline text-sm font-semibold truncate max-w-[100px]"
          style={{ color: "#f0f7ec" }}
        >
          {user.name?.split(" ")[0]}
        </span>
        <svg
          className="w-3.5 h-3.5 hidden sm:block transition-transform duration-200"
          style={{
            color: "#7a9c6e",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute top-full right-0 mt-2 w-64 rounded-xl shadow-2xl p-2 z-[99]"
          style={{
            background: "#162513",
            border: "1px solid #2a3d22",
          }}
        >
          {/* User info */}
          <div
            className="px-3 py-3 mb-1"
            style={{ borderBottom: "1px solid #2a3d22" }}
          >
            <p
              className="text-[10px] uppercase tracking-wider font-bold mb-1"
              style={{ color: "#4a6b40" }}
            >
              Signed in as
            </p>
            <p
              className="text-sm font-bold truncate"
              style={{ color: "#f0f7ec" }}
              title={user.email}
            >
              {user.email}
            </p>
            <span
              className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
              style={{
                background: "rgba(154,216,114,0.12)",
                border: "1px solid rgba(154,216,114,0.25)",
                color: "#9AD872",
              }}
            >
              {user.role}
            </span>
          </div>

          {/* Links */}
          <div className="space-y-0.5">
            {[
              { href: dashHref, label: "My Dashboard" },
              { href: "/sessions", label: "Browse Sessions" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{ color: "#7a9c6e" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#1c2f17";
                  (e.currentTarget as HTMLElement).style.color = "#f0f7ec";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "#7a9c6e";
                }}
              >
                {item.label}
              </Link>
            ))}

            <div style={{ borderTop: "1px solid #2a3d22", paddingTop: "4px", marginTop: "4px" }}>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                style={{ color: "#f87171" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
