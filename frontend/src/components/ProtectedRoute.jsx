import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authentication";
import { useAuthzStore } from "../store/useAuthzStore";

export default function ProtectedRoute({ perm, children }) {
  const token = useAuthStore((s) => s.token);
  const loading = useAuthzStore((s) => s.loading);
  const can = useAuthzStore((s) => s.can);
  const { pathname } = useLocation();

  if (!token) return <Navigate to="/login" replace state={{ from: pathname }} />;
  if (loading) return null;        // or a page skeleton
  if (perm && !can(perm)) return <Navigate to="/" replace />;

  return children;
}
