import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://sports-plus-backend.vercel.app/api/v1",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

function setAccessTokenCookie(token: string) {
  const exp = new Date(Date.now() + 120 * 60 * 1000).toUTCString();
  document.cookie = `access_token=${encodeURIComponent(token)}; expires=${exp}; path=/; SameSite=Lax; Secure`;
}

function clearAccessTokenCookie() {
  document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

// ── Response interceptor ────────────────────────────────────────────────────
api.interceptors.response.use(
  (res) => {
    const url = res.config.url ?? "";

    // Login → frontend cookie set
    if (url.includes("/auth/login")) {
      const token = res.data?.data?.accessToken;
      if (token && typeof document !== "undefined") {
        setAccessTokenCookie(token);
      }
    }

    // Logout → frontend cookie clear
    if (url.includes("/auth/logout")) {
      if (typeof document !== "undefined") {
        clearAccessTokenCookie();
      }
    }

    return res;
  },

  // ── 401 → silent refresh → retry ─────────────────────────────────────────
  async (err) => {
    const originalRequest = err.config;

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const resp = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
          {},
          { withCredentials: true },
        );

        const newToken = resp.data?.data?.accessToken ?? resp.data?.accessToken;
        if (newToken && typeof document !== "undefined") {
          setAccessTokenCookie(newToken);
        }

        return api(originalRequest);
      } catch {
        if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth")) {
          clearAccessTokenCookie();
          window.location.href = "/auth?tab=login";
        }
        return Promise.reject(err);
      }
    }

    return Promise.reject(err);
  },
);