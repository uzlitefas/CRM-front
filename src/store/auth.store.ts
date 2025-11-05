import { api } from "@/service/api";
import { create } from "zustand";

export type Role = "admin" | "teacher" | "manager";

export type User = {
  id: string;
  email: string;
  role: Role;
  mustChangePassword: boolean;
  firstName?: string;
  lastName?: string;
};

type AuthState = {
  token: string | null;
  user: User | null;
  booted: boolean;

  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => Promise<void>;
  setBooted: (v: boolean) => void;
  refreshUser: () => Promise<void>;
};

export const useAuth = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  booted: false,

  login: (accessToken, refreshToken, user) => {
    sessionStorage.setItem(
      "authData",
      JSON.stringify({ accessToken, refreshToken, user })
    );
    set({ token: accessToken, user });
  },

  logout: async () => {
    try {
      const stored = sessionStorage.getItem("authData");
      const refreshToken = stored ? JSON.parse(stored).refreshToken : null;
      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken });
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      sessionStorage.removeItem("authData");
      set({ token: null, user: null, booted: false });
    }
  },

  setBooted: (v) => set({ booted: v }),

  refreshUser: async () => {
    const stored = sessionStorage.getItem("authData");
    if (!stored) {
      set({ token: null, user: null, booted: true });
      return;
    }

    const { refreshToken, user } = JSON.parse(stored);

    if (!refreshToken || !user) {
      set({ token: null, user: null, booted: true });
      return;
    }

    try {
      const { data } = await api.post("/auth/refresh", {
        refreshToken,
        userId: user.id,
      });
      if (data?.accessToken && data?.refreshToken && data?.user) {
        sessionStorage.setItem(
          "authData",
          JSON.stringify({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            user: data.user,
          })
        );
        set({ token: data.accessToken, user: data.user });
      } else {
        set({ token: null, user: null });
      }
    } catch {
      set({ token: null, user: null });
    } finally {
      set({ booted: true });
    }
  },
}));
