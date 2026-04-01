// Hook for managing private route access and authentication logic
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "./use-auth";

export function usePrivate() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login" as any);
    }
  }, [isAuthenticated, loading, router]);
}
