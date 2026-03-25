import { useEffect, useState, type ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';

/**
 * AuthProvider — runs once on app startup.
 *
 * 1. If we already have a persisted accessToken (from "Remember Me"),
 *    we skip refresh and use it immediately.
 * 2. If we have a persisted user but NO token, try silent refresh
 *    via the HttpOnly cookie (works in same-origin / production).
 * 3. If neither, user is not logged in — proceed to login page.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const setHydrated = useAuthStore((s) => s.setHydrated);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hydrate = async () => {
      // Case 1: Token restored from localStorage (Remember Me was on)
      if (accessToken) {
        setHydrated(true);
        setLoading(false);
        return;
      }

      // Case 2: User exists but no token — try silent refresh via cookie
      if (user) {
        try {
          const res = await api.post('/auth/refresh-token');
          const newToken = res.data.accessToken;
          if (res.data.user) {
            setAuth(newToken, res.data.user);
          } else {
            setAccessToken(newToken);
          }
        } catch {
          // Cookie expired, invalid, or cross-origin issue — clear
          clearAuth();
        }
      }

      // Case 3: No user, no token — not logged in
      setHydrated(true);
      setLoading(false);
    };

    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f0fcfb' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-3 border-[#4FB6B2] border-t-transparent animate-spin" />
          <p className="text-sm text-[#7A8A8A] font-medium">Restoring session...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
