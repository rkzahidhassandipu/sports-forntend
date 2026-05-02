// src/proxy.ts
// Handles authentication checks and role-based route protection.
// This file is imported by src/middleware.ts which is Next.js's entry point.

import { NextRequest, NextResponse } from "next/server";
import { Role } from "./types/enums";

// Maps each role to its dedicated dashboard root path
const ROLE_DASHBOARD_MAP: Record<Role, string> = {
  [Role.ADMIN]: "/dashboard/admin",
  [Role.COACH]: "/dashboard/coach",
  [Role.TRAINER]: "/dashboard/trainer",
  [Role.RECEPTIONIST]: "/dashboard/reception",
  [Role.MEMBER]: "/dashboard/member",
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Require authentication ──────────────────────────────────────────
  const token = request.cookies.get("access_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  // ── 2. Decode role from JWT payload (no verification — server-side only) ─
  let role: Role;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    role = payload.role as Role;
  } catch {
    // Malformed token → clear cookie and redirect to login
    const response = NextResponse.redirect(new URL("/auth", request.url));
    response.cookies.delete("access_token");
    return response;
  }

  const allowedPath = ROLE_DASHBOARD_MAP[role];

  // ── 3. /dashboard root → redirect to role-specific dashboard ──────────
  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    return NextResponse.redirect(new URL(allowedPath, request.url));
  }

  // ── 4. Block cross-role dashboard access ──────────────────────────────
  const allDashboardPaths = Object.values(ROLE_DASHBOARD_MAP);

  const isAccessingWrongDashboard = allDashboardPaths.some(
    (path) => pathname.startsWith(path) && !pathname.startsWith(allowedPath)
  );

  if (isAccessingWrongDashboard) {
    return NextResponse.redirect(new URL(allowedPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
