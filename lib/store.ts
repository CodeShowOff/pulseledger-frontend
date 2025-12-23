import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type UserRole = "client" | "coach" | "admin";

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  referralCode?: string | null;
  coachId?: string | null;
  avatarUrl?: string | null;
  companyName?: string | null;
}

type RawUser = Partial<User> & { _id?: string };

interface AuthState {
  user: User | null;
  accessToken: string | null;
  hydrated: boolean;
  setUser: (user: RawUser | null) => void;
  setAccessToken: (token: string | null) => void;
  setAvatarUrl: (url: string | null) => void;
  logout: () => void;
}

const storage =
  typeof window !== "undefined"
    ? createJSONStorage(() => window.localStorage)
    : undefined;

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      hydrated: false,
      setUser: (raw) => {
        if (!raw) {
          set({ user: null });
          return;
        }

        const id = raw.id ?? raw._id;
        if (!id) {
          set({ user: null });
          return;
        }

        set({
          user: {
            id,
            fullName: raw.fullName ?? "",
            email: raw.email ?? "",
            role: (raw.role as UserRole) ?? "client",
            referralCode: raw.referralCode ?? null,
            coachId: raw.coachId ?? null,
            avatarUrl: (raw as any).avatarUrl ?? null,
          },
          hydrated: true,
        });
      },
      setAccessToken: (token) => set({ accessToken: token }),
      setAvatarUrl: (url) =>
        set((state) => ({ user: state.user ? { ...state.user, avatarUrl: url } : state.user })),
      logout: () => {
        // Attempt server logout to clear refresh token cookie
        if (typeof window !== 'undefined') {
          // Use fetch to avoid circular import with axios
          try {
            fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
          } catch {/* ignore */}
        }
        set({ user: null, accessToken: null, hydrated: true });
        if (typeof document !== "undefined") {
          document.cookie = "accessToken=; Max-Age=0; path=/;";
        }
      },
    }),
    {
      name: "auth-storage",
      storage,
      // Hydration is marked within state setters; no global set() here
      onRehydrateStorage: () => () => {},
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        hydrated: state.hydrated,
      }),
    }
  )
);
