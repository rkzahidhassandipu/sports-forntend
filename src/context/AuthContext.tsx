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
import { authService, RegisterDto } from "@/services/auth.service";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface AuthUser {
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
  register: (name: string, email: string, password: string, phone?: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
  setAccessToken: (token: string) => void;
}

// ─────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

// ─────────────────────────────────────────────
// Role → Dashboard route map (single source of truth)
// ─────────────────────────────────────────────
const ROLE_ROUTES: Record<Role, string> = {
  [Role.ADMIN]: "/dashboard/admin",
  [Role.TRAINER]: "/dashboard/trainer",
  [Role.COACH]: "/dashboard/coach",
  [Role.RECEPTIONIST]: "/dashboard/reception",
  [Role.MEMBER]: "/dashboard/member",
};

// ─────────────────────────────────────────────
// Cookie Helpers
// ─────────────────────────────────────────────
const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

function clearTokens() {
  deleteCookie(ACCESS_TOKEN_KEY);
  deleteCookie(REFRESH_TOKEN_KEY);
}

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isLoading: true,
  });

  // ── Hydrate auth state from cookies on app load ──
  useEffect(() => {
    const init = async () => {
      const accessToken = getCookie(ACCESS_TOKEN_KEY);
      const refreshToken = getCookie(REFRESH_TOKEN_KEY);

      if (!accessToken && !refreshToken) {
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        const user = await fetchMe(accessToken!);
        setState({ user, accessToken, isLoading: false });
      } catch {
        // Access token expired — attempt silent refresh
        if (refreshToken) {
          try {
            const { accessToken: newToken, user } =
              await refreshAccessToken(refreshToken);
            setCookie(ACCESS_TOKEN_KEY, newToken);
            setState({ user, accessToken: newToken, isLoading: false });
          } catch {
            clearTokens();
            setState({ user: null, accessToken: null, isLoading: false });
          }
        } else {
          clearTokens();
          setState({ user: null, accessToken: null, isLoading: false });
        }
      }
    };

    init();
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────
  const login = useCallback(
    async (email: string, password: string) => {
      // authService.login already writes the cookies; we just sync React state
      const data = await authService.login({ email, password });

      setState({
        user: data.user,
        accessToken: data.accessToken,
        isLoading: false,
      });

      router.push(ROLE_ROUTES[data.user.role as Role] ?? "/dashboard");
    },
    [router],
  );

  // ── Register ───────────────────────────────────────────────────────────
  // Registers a new user then automatically logs them in.
  const register = useCallback(
  async (name: string, email: string, password: string, phone?: string, role?: string) => {
    await authService.register({ name, email, password, phone, role });
    const data = await authService.login({ email, password }); // Login response থেকে ডাটা নিন
    
    // কুকি থেকে না খুঁজে সরাসরি response থেকে টোকেন নিন
    const user = await fetchMe(data.accessToken); 
    
    setState({
      user,
      accessToken: data.accessToken,
      isLoading: false,
    });
    router.push(ROLE_ROUTES[user.role] ?? "/dashboard");
  },
  [router]
);

  // ── Logout ─────────────────────────────────────────────────────────────
  // Delegates to authService.logout which handles cookie cleanup and
  // the server-side token invalidation call.
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // authService.logout already handles errors gracefully; clear anyway
      clearTokens();
    } finally {
      setState({ user: null, accessToken: null, isLoading: false });
      router.push("/auth");
    }
  }, [router]);

  // ── Token update from axios interceptor ────────────────────────────────
  const setAccessToken = useCallback((token: string) => {
    setCookie(ACCESS_TOKEN_KEY, token);
    setState((prev) => ({ ...prev, accessToken: token }));
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, login, register, logout, setAccessToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

// ─────────────────────────────────────────────
// Private API Helpers (module-internal only)
// ─────────────────────────────────────────────
async function fetchMe(accessToken: string): Promise<AuthUser> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Unauthorized");
  const { data } = await res.json();
  return data;
}

async function refreshAccessToken(
  refreshToken: string,
): Promise<{ accessToken: string; user: AuthUser }> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    },
  );
  if (!res.ok) throw new Error("Refresh failed");
  const { data } = await res.json();
  return data;
}
