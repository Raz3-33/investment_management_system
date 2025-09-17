// src/components/ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "../store/authentication";
import { useAuthzStore } from "../store/useAuthzStore";

export default function ProtectedRoute({ perm, children }) {
  const token = useAuthStore((s) => s.token);
  const { pathname } = useLocation();

  const loading = useAuthzStore((s) => s.loading);
  const isReady = useAuthzStore((s) => s.isReady);
  const can = useAuthzStore((s) => s.can);
  const bootstrap = useAuthzStore((s) => s.bootstrap);

  // Kick off bootstrap exactly once per page load when we have a token
  useEffect(() => {
    if (token) bootstrap();
  }, [token, bootstrap]);

  if (!token) {
    return <Navigate to="/login" replace state={{ from: pathname }} />;
  }

  // ⛔️ Do not decide until authz is bootstrapped
  if (!isReady || loading) {
    // show a small skeleton (or null)
    return <div className="p-6 text-sm text-gray-500">Loading…</div>;
  }

  if (perm && !can(perm)) {
    // user is authenticated but not authorized for this route
    return <Navigate to="/" replace />;
  }

  return children;
}
