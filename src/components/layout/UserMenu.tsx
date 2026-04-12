"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface UserMenuProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Use AuthContext.logout — handles cookie cleanup, server call, state reset and redirect
  const { logout } = useAuth();

  if (!user) return null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    // Clear React Query cache for the user session
    queryClient.setQueryData(["user-session"], null);
    queryClient.removeQueries({ queryKey: ["user-session"] });
    // AuthContext.logout handles: authService.logout (server + cookie cleanup),
    // auth state reset, and redirect to /auth
    await logout();
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 p-1 sm:pr-3 rounded-full bg-brand-card border border-brand-border hover:border-lime-500/50 transition-all duration-200 shrink-0",
          isOpen && "ring-2 ring-lime-500/20 border-lime-500/50"
        )}
      >
        <div className="w-8 h-8 rounded-full bg-lime-500 flex items-center justify-center text-brand-dark font-bold text-sm shrink-0">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <span className="hidden sm:inline text-sm font-medium text-foreground truncate max-w-[100px]">
          {user.name.split(" ")[0]}
        </span>
        <svg
          className={cn("w-4 h-4 opacity-50 transition-transform hidden xs:block", isOpen && "rotate-180")}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-60 bg-brand-mid border border-brand-border rounded-xl shadow-2xl p-2 z-[99] animate-in fade-in zoom-in duration-200 origin-top-right bg-gray-200">
          <div className="px-3 py-3 border-b border-brand-border mb-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Account</p>
            <p className="text-sm font-bold text-foreground truncate" title={user.email}>
              {user.email}
            </p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-lime-500/10 text-lime-500 uppercase">
              {user.role}
            </span>
          </div>

          <div className="space-y-1">
            <Link
              href="/dashboard"
              className="block hover:bg-gray-300/50 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsOpen(false)}
            >
              My Dashboard
            </Link>
            <Link
              href="/profile/settings"
              className="block hover:bg-gray-300/50 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Settings
            </Link>
            <div className="pt-1 mt-1 border-t border-brand-border">
              <button
                onClick={handleLogout}
                className="w-full text-left hover:bg-gray-300/50 rounded-lg px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors font-medium"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
