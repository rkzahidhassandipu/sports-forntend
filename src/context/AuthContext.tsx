// src/context/AuthContext.tsx
"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { Role } from "@/types/enums";
import { authService } from "@/services/auth.service";
import { useQueryClient } from "@tanstack/react-query";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    phone?: string,
    role?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  setAccessToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Role → Dashboard route ───────────────────────────────────────────────────
const ROLE_ROUTES: Record<Role, string> = {
  [Role.ADMIN]:        "/dashboard/admin",
  [Role.TRAINER]:      "/dashboard/trainer",
  [Role.COACH]:        "/dashboard/coach",
  [Role.RECEPTIONIST]: "/dashboard/reception",
  [Role.MEMBER]:       "/dashboard/member",
};

// ─── Cookie helpers ───────────────────────────────────────────────────────────
const ACCESS_TOKEN_KEY  = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  // Secure flag production-এ লাগবে — SameSite=Lax middleware পড়তে পারে
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${secure}`;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  // Set/clear সময় same attributes দিতে হবে
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax${secure}`;
}

function clearTokens() {
  deleteCookie(ACCESS_TOKEN_KEY);
  deleteCookie(REFRESH_TOKEN_KEY);
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const router     = useRouter();
  const queryClient = useQueryClient();

  const [state, setState] = useState<AuthState>({
    user:        null,
    accessToken: null,
    isLoading:   true,
  });

  // ── logout ──────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await authService.logout(); // backend cookie clear করবে
    } catch {
      // backend error হলেও frontend clear করব
    } finally {
      clearTokens();                                          // frontend cookie clear
      setState({ user: null, accessToken: null, isLoading: false });
      queryClient.clear();                                    // সব cache মুছে দাও
      router.push("/auth?tab=login");
    }
  }, [router, queryClient]);

  // ── setAccessToken ──────────────────────────────────────────────────────────
  const setAccessToken = useCallback((token: string) => {
    setCookie(ACCESS_TOKEN_KEY, token, 1); // 1 দিন = 24 ঘণ্টা
    setState((p) => ({ ...p, accessToken: token }));
  }, []);

  // ── login ───────────────────────────────────────────────────────────────────
  const login = useCallback(
    async (email: string, password: string) => {
      const raw   = await authService.login({ email, password });
      const user: AuthUser = raw?.user ?? raw?.data?.user;
      const token: string  =
        raw?.accessToken ??
        raw?.data?.accessToken ??
        getCookie(ACCESS_TOKEN_KEY) ??
        "";

      // Frontend cookie set — middleware এটা পড়বে
      if (token) setCookie(ACCESS_TOKEN_KEY, token, 1);

      setState({ user, accessToken: token, isLoading: false });
      queryClient.setQueryData(["user-session"], user);
      router.push(ROLE_ROUTES[user.role as Role] ?? "/dashboard");
    },
    [router, queryClient],
  );

  // ── register ─────────────────────────────────────────────────────────────────
  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      phone?: string,
      role?: string,
    ) => {
      await authService.register({ name, email, password, phone, role });
      await login(email, password);
    },
    [login],
  );

  // ── Hydration — app load হলে token থেকে user restore করো ──────────────────
  useEffect(() => {
    const init = async () => {
      const token = getCookie(ACCESS_TOKEN_KEY);

      if (!token) {
        // Token নেই — guest state
        setState({ user: null, accessToken: null, isLoading: false });
        return;
      }

      try {
        // Token আছে → /auth/me দিয়ে user fetch করো
        const user = await getMeUser();
        setState({ user, accessToken: token, isLoading: false });
        queryClient.setQueryData(["user-session"], user);
      } catch {
        // Token expired বা invalid → সব clear করো
        clearTokens();
        setState({ user: null, accessToken: null, isLoading: false });
      }
    };

    init();
  }, []); // logout dependency নেই — infinite loop এড়াতে

  return (
    <AuthContext.Provider
      value={{ ...state, login, register, logout, setAccessToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

// ─── getMeUser ────────────────────────────────────────────────────────────────
export async function getMeUser(): Promise<AuthUser> {
  const user = await authService.getMe();
  if (!user?.id || !user?.role)
    throw new Error("Invalid user shape from /auth/me");
  return user as AuthUser;
}