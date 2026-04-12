// hooks/useUser.ts
import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";

export function useUser() {
  return useQuery({
    queryKey: ["user-session"],
    queryFn: async () => {
      try {
        const res = await authService.getMe();
        return res.data || res; 
      } catch (error) {
        return null; 
      }
    },
    retry: false, 
    staleTime: 1000 * 60 * 5, 
    refetchOnWindowFocus: false, 
  });
}