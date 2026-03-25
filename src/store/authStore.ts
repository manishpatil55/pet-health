import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types';

/**
 * Auth store — hybrid persistence.
 *
 * When "Remember Me" is checked (default), the accessToken is persisted
 * to localStorage alongside the user profile. This ensures the session
 * survives page refreshes in local development where the backend and
 * frontend are on different ports (HttpOnly cookies won't be sent
 * cross-origin in dev).
 *
 * When "Remember Me" is unchecked, the token is memory-only — closing
 * the tab will log the user out.
 */

interface AuthStore {
  accessToken: string | null;
  user: User | null;
  rememberMe: boolean;
  _hydrated: boolean;

  setAuth: (token: string, user: User) => void;
  setAccessToken: (token: string) => void;
  setUser: (user: User) => void;
  setRememberMe: (remember: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      rememberMe: true,
      _hydrated: false,

      setAuth: (token, user) => set({ accessToken: token, user }),
      setAccessToken: (token) => set({ accessToken: token }),
      setUser: (user) => set({ user }),
      setRememberMe: (remember) => set({ rememberMe: remember }),
      setHydrated: (hydrated) => set({ _hydrated: hydrated }),
      clearAuth: () => {
        set({ accessToken: null, user: null, _hydrated: true });
        localStorage.removeItem('pawhealth-auth');
      },
      isAuthenticated: () => !!get().accessToken,
    }),
    {
      name: 'pawhealth-auth',
      storage: createJSONStorage(() => localStorage),
      // Persist user + token when "Remember Me" is on
      partialize: (state) => ({
        user: state.user,
        rememberMe: state.rememberMe,
        // Only persist token if rememberMe is true
        accessToken: state.rememberMe ? state.accessToken : null,
      }),
    },
  ),
);
