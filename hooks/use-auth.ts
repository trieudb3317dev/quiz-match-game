// Hook for managing authentication state and logic

import React, { useState } from "react";
import {
  signOut as apiSignOut,
  getCurrentUser,
  refreshToken,
  signIn,
  signUp,
} from "../api";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to load the currently authenticated user (relies on HttpOnly cookie)
  const loadCurrentUser = async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const current = await getCurrentUser();
      // API may return { user } or the user object directly depending on backend
      const resolved =
        current && typeof current === "object" && "user" in current
          ? (current as any).user
          : current;
      if (!signal || !signal.aborted) setUser(resolved ?? null);
      return resolved ?? null;
    } catch (err: any) {
      // If we received a 401 Unauthorized, try to refresh the token once and retry
      const status = err && (err.status ?? err?.responseStatus ?? null);
      if (status === 401) {
        try {
          // attempt to refresh server-side cookie
          await refreshToken();
          // retry fetching current user
          const retry = await getCurrentUser();
          const resolvedRetry =
            retry && typeof retry === "object" && "user" in retry
              ? (retry as any).user
              : retry;
          if (!signal || !signal.aborted) setUser(resolvedRetry ?? null);
          return resolvedRetry ?? null;
        } catch (refreshErr: any) {
          if (!signal || !signal.aborted)
            setError(refreshErr?.message ?? String(refreshErr));
          setUser(null);
          throw refreshErr;
        }
      }

      if (!signal || !signal.aborted) setError(err?.message ?? String(err));
      setUser(null);
      throw err;
    } finally {
      if (!signal || !signal.aborted) setLoading(false);
    }
  };

  const handleSignIn = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      // This request should trigger the server to set HttpOnly cookies (access/refresh)
      await signIn(username, password);
      // After cookies are set, fetch the current user via /auth/me which reads the cookie
      return await loadCurrentUser();
    } catch (err: any) {
      setError(err?.message ?? String(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (
    username: string,
    email: string,
    password: string,
  ) => {
    setLoading(true);
    setError(null);
    try {
      await signUp(username, email, password);
      // After successful sign-up, backend may already log user in or set cookies; try loading user
      const current = await loadCurrentUser();
      return current;
    } catch (err: any) {
      setError(err?.message ?? String(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    setError(null);
    try {
      await apiSignOut();
      setUser(null);
    } catch (err: any) {
      setError(err?.message ?? String(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      // Call refresh endpoint which should set new access cookie when successful
      await refreshToken();
      const current = await loadCurrentUser();
      return current;
    } catch (err: any) {
      setError(err?.message ?? String(err));
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // On mount, check for existing authentication (cookies sent automatically by browser)
  React.useEffect(() => {
    const controller = new AbortController();
    loadCurrentUser(controller.signal).catch(() => {
      /* ignore - errors are stored in state */
    });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isAuthenticated = Boolean(user);

  return {
    user,
    loading,
    error,
    isAuthenticated,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    refresh: handleRefresh,
    reloadUser: loadCurrentUser,
  };
}
