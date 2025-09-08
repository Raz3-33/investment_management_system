// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthzStore } from "../store/useAuthzStore";

export default function ProtectedRoute({ perm, children }) {
  const loading = useAuthzStore((s) => s.loading);
  const can = useAuthzStore((s) => s.can);

  if (loading) return null; // avoid flicker on initial load
  return can(perm) ? children : <Navigate to="/" replace />;
}
