// src/services/auth.service.ts
import { api } from "@/lib/api";
import { ApiResponse } from "@/types";
import { User } from "@/types/user";

// ─── Cookie helpers (mirrors AuthContext) ──────────────────────────────────
const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}
// ────────────────────────────────────────────────────────────────────────────

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
}

export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export const authService = {
  // ── Register ───────────────────────────────────────────────────────────
  async register(data: RegisterDto) {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  // ── Login ──────────────────────────────────────────────────────────────
  async login(credentials: LoginDto) {
    const response = await api.post("/auth/login", credentials);

    const { accessToken, refreshToken } = response.data.data;
    console.log(response);

    if (accessToken && typeof document !== "undefined") {
      const days1 = new Date(Date.now() + 1 * 864e5).toUTCString();
      const days7 = new Date(Date.now() + 7 * 864e5).toUTCString();
      document.cookie = `${ACCESS_TOKEN_KEY}=${encodeURIComponent(accessToken)}; expires=${days1}; path=/; SameSite=Lax`;
      document.cookie = `${REFRESH_TOKEN_KEY}=${encodeURIComponent(refreshToken)}; expires=${days7}; path=/; SameSite=Lax`;
    }

    return response.data;
  },
async getMe(): Promise<User> {
  const { data } = await api.get<ApiResponse<User>>('/auth/me');
  return data.data;
},

  // ── Refresh token ──────────────────────────────────────────────────────
  // Reads refresh token from cookie (NOT localStorage) and stores the new
  // access token back into a cookie.
  async refreshToken() {
    const refreshToken = getCookie(REFRESH_TOKEN_KEY);
    const response = await api.post("/auth/refresh-token", { refreshToken });

    const { accessToken } = response.data.data;

    if (accessToken && typeof document !== "undefined") {
      const days1 = new Date(Date.now() + 1 * 864e5).toUTCString();
      document.cookie = `${ACCESS_TOKEN_KEY}=${encodeURIComponent(
        accessToken,
      )}; expires=${days1}; path=/; SameSite=Lax`;
    }

    return response.data.data;
  },

  // ── Forgot password ────────────────────────────────────────────────────
  async forgotPassword(email: string) {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  // ── Reset password ─────────────────────────────────────────────────────
  async resetPassword(data: { token: string; password: string }) {
    const response = await api.post("/auth/reset-password", data);
    return response.data;
  },

  // ── Verify email ───────────────────────────────────────────────────────
  async verifyEmail(token: string) {
    const response = await api.get(`/auth/verify-email?token=${token}`);
    return response.data;
  },

  // ── Logout ─────────────────────────────────────────────────────────────
  // Reads refresh token from cookie (NOT localStorage), sends it to the
  // server, then clears both auth cookies regardless of server response.
  async logout() {
    const refreshToken = getCookie(REFRESH_TOKEN_KEY);
    try {
      await api.post("/auth/logout", { refreshToken });
    } catch (error) {
      console.warn(
        "Logout API failed, clearing local auth state anyway.",
        error,
      );
    } finally {
      deleteCookie(ACCESS_TOKEN_KEY);
      deleteCookie(REFRESH_TOKEN_KEY);
    }
  },

  // ── Change password ────────────────────────────────────────────────────
  async changePassword(data: { currentPassword: string; newPassword: string }) {
    const response = await api.post("/auth/change-password", data);
    return response.data;
  },

  // ── Active sessions ────────────────────────────────────────────────────
  async getSessions() {
    const response = await api.get("/auth/sessions");
    return response.data;
  },
};
