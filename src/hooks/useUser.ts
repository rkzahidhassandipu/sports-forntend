// hooks/useUser.ts
import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function useUser() {
  return useQuery<SessionUser | null>({
    queryKey: ["user-session"],
    queryFn: async () => {
      try {
        const user = await authService.getMe();
        if (!user?.id) return null;
        return user as SessionUser;
      } catch {
        return null;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}