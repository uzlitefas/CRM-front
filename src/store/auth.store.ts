import { api } from "@/service/api";
import { create } from "zustand";

export type Role = "admin" | "doctor" | "reception";
export type User = {
  id: string;
  email: string;
  role: Role;
  mustChangePassword: boolean;
};

type AuthState = {
  token: string | null;        
  user: User | null;
  booted: boolean;

  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
  setBooted: (v: boolean) => void;

  changing: boolean;
  changeError: string | null;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;

  refreshUser: () => Promise<void>;
};

export const useAuth = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  booted: false,

  login: (accessToken, refreshToken, user) => {
    sessionStorage.setItem("refreshToken", refreshToken);
    set({ token: accessToken, user });
  },

  logout: async () => {
    try {
      await api.post("/auth/logout", {
        refreshToken: sessionStorage.getItem("refreshToken"),
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      sessionStorage.removeItem("refreshToken");
      set({ token: null, user: null, booted: false });
    }
  },

  setBooted: (v) => set({ booted: v }),

  changing: false,
  changeError: null,

  changePassword: async (currentPassword, newPassword) => {
    set({ changing: true, changeError: null });
    try {
      const { data } = await api.post("/auth/change-password", { currentPassword, newPassword });
      const user = get().user;
      if (user) set({ user: { ...user, mustChangePassword: false } });
      console.log(data.message);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        (Array.isArray(err?.response?.data)
          ? err.response.data.join(", ")
          : "") ||
        "Parolni almashtirishda xatolik";
      set({ changeError: msg });
      throw err;
    } finally {
      set({ changing: false });
    }
  },

  refreshUser: async () => {
    const refreshToken = sessionStorage.getItem("refreshToken");
    if (!refreshToken) {
      set({ token: null, user: null, booted: true });
      return;
    }

    try {
      const { data } = await api.post("/auth/refresh", { refreshToken });
      if (data?.access_token && data?.user) {
        set({ token: data.access_token, user: data.user });
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
