import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true, 
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // token refresh api http request
        // here we assume that the refresh token is sent as an HttpOnly cookie, so we don't need to include it in the request body or headers
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        // refresh success original request send 
        return api(originalRequest);
      } catch (refreshError) {
        // if refresh also fails, then logout the user and redirect to the auth page only when not already there
        if (typeof window !== "undefined") {
          if (!window.location.pathname.startsWith("/auth")) {
            window.location.href = "/auth?tab=login";
          }
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(err);
  }
);