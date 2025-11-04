import { useAuth } from "@/store/auth.store";
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true, 
});

api.interceptors.request.use((config) => {
  const token = useAuth.getState().token;
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
        original.headers.Authorization = `Bearer ${useAuth.getState().token}`;
        original._retry = true;
        return api(original);
      }

      try {
        refreshing = true;
        original._retry = true;

        const refreshToken = sessionStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");

        const { data } = await api.post("/auth/refresh", { refreshToken });

        if (data?.access_token && data?.user && data?.refresh_token) {
          useAuth.getState().login(data.access_token, data.refresh_token, data.user);

          waiters.forEach((fn) => fn());
          waiters = [];

          original.headers.Authorization = `Bearer ${data.access_token}`;
          return api(original);
        } else {
          throw new Error("Invalid refresh response");
        }
      } catch (e) {
        useAuth.getState().logout();
        throw e;
      } finally {
        refreshing = false;
      }
    }

    throw err;
  }
);
