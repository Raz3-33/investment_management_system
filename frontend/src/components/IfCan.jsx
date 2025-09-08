// src/components/IfCan.tsx

import { useAuthzStore } from "../store/useAuthzStore";

export default function IfCan({ perm, children }) {
  const loading = useAuthzStore((s) => s.loading);
  const can = useAuthzStore((s) => s.can);
  if (loading) return null; // prevent flash while fetching
  return can(perm) ? <>{children}</> : null;
}
