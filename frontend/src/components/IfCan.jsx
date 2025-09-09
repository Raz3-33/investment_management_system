// IfCan.jsx
import { useAuthzStore } from "../store/useAuthzStore";

export default function IfCan({ perm, children, not = null }) {
  const loading = useAuthzStore((s) => s.loading);
  const can = useAuthzStore((s) => s.can);
  if (loading) return null; 
  return can(perm) ? <>{children}</> : not;
}
