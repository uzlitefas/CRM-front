import axios from "axios";
import { useAuth } from "@/store/auth.store";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const stored = sessionStorage.getItem("authData");
  const token = stored ? JSON.parse(stored).accessToken : null;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing = false;
let waiters: Array<() => void> = [];

api.interceptors.response.use(
  (response) => response,
  async (err) => {
    const original = err.config;

    if (err.response?.status === 401 && !original._retry) {
      if (refreshing) {
        await new Promise<void>((res) => waiters.push(res));
        const stored = sessionStorage.getItem("authData");
        const token = stored ? JSON.parse(stored).accessToken : null;
        original.headers.Authorization = token ? `Bearer ${token}` : "";
        original._retry = true;
        return api(original);
      }

      try {
        refreshing = true;
        original._retry = true;

        const stored = sessionStorage.getItem("authData");
        if (!stored) throw new Error("No auth data");

        const { refreshToken, user } = JSON.parse(stored);
        if (!refreshToken || !user) throw new Error("No refresh token or user");

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
          useAuth
            .getState()
            .login(data.accessToken, data.refreshToken, data.user);

          waiters.forEach((fn) => fn());
          waiters = [];

          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        } else {
          throw new Error("Invalid refresh response");
        }
      } catch (e) {
        await useAuth.getState().logout();
        throw e;
      } finally {
        refreshing = false;
      }
    }

    throw err;
  }
);
