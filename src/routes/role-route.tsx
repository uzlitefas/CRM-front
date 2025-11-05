import { Navigate } from "react-router-dom";
import { useAuth } from "@/store/auth.store";

type Role = "admin" | "manager" | "teacher";

interface RoleRouteProps {
  roles: Role[];
  children: React.ReactNode;
}

export function RoleRoute({ roles, children }: RoleRouteProps) {
  const { token, user } = useAuth();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (
    !roles.map((r) => r.toLowerCase()).includes(user.role.toLowerCase() as Role)
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
