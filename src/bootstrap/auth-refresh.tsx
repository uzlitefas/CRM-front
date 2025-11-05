import { api } from "@/service/api";
import { useAuth } from "@/store/auth.store";
import { useEffect } from "react";

export function AuthRefresh({ children }: { children: React.ReactNode }) {
  const { token, user, login, logout, booted, setBooted } = useAuth();

  useEffect(() => {
    (async () => {
      if (booted) return;

      try {
        const stored = sessionStorage.getItem("authData");

        if (!stored) {
          await logout();
          return;
        }

        const {
          refreshToken,
          user: storedUser,
          accessToken,
        } = JSON.parse(stored);

        if (!refreshToken || !storedUser) {
          await logout();
          return;
        }

        if (!accessToken) {
          const { data } = await api.post("/auth/refresh", {
            refreshToken,
            userId: storedUser.id,
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
            login(data.accessToken, data.refreshToken, data.user);
          } else {
            await logout();
          }
        } else {
          login(accessToken, refreshToken, storedUser);
        }
      } catch {
        await logout();
      } finally {
        setBooted(true);
      }
    })();
  }, [booted, token, user, login, logout, setBooted]);

  if (!booted) return null;
  return <>{children}</>;
}
