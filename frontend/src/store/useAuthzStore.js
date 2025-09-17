// src/store/useAuthzStore.ts
import { create } from "zustand";
import { api } from "../services/api";



export const useAuthzStore = create()((set, get) => ({
  loading: false,
  isReady: false,            // ✅ start not ready
  isAdmin: false,
  permissions: new Set(),
  error: null,

  setIsAdmin: (v) => set({ isAdmin: !!v }),

  setPermissions: (list) => {
    const raw = Array.isArray(list) ? list : [];
    // Optional: normalize to lowercase for safety
    const lower = raw.map((p) => String(p).trim());
    set({
      permissions: new Set(lower),
      loading: false,
      isReady: true,         // ✅ mark ready when permissions are set
    });
  },

  reset: () =>
    set({
      loading: false,
      isReady: true,         // ✅ still 'ready' after reset (no pending fetch)
      isAdmin: false,
      permissions: new Set(),
      error: null,
    }),

  bootstrap: async () => {
    const token =
      localStorage.getItem("token") ??
      JSON.parse(localStorage.getItem("token") || "null");
    if (!token) {
      // No token => ready (nothing to load)
      set({ isAdmin: false, permissions: new Set(), loading: false, isReady: true });
      return;
    }
    // Prevent duplicate calls
    const { loading, isReady } = get();
    if (loading || isReady) return;

    set({ loading: true, error: null });
    try {
      const res = await api.get("/me/permissions", {
        headers: { authorization: `Bearer ${token}` },
      });
      // Be robust to different shapes: {data:{...}} or plain {...}
      const payload = res?.data?.data ?? res?.data ?? {};
      const isAdmin = !!payload.isAdmin;
      const perms = Array.isArray(payload.permissions) ? payload.permissions : [];

      set({
        isAdmin,
        permissions: new Set(perms.map((p) => String(p).trim())),
        loading: false,
        isReady: true,
      });
    } catch (e) {
      set({
        loading: false,
        isReady: true,        // ✅ even on error, we’re done (so ProtectedRoute can decide)
        error:
          e?.response?.data?.message ||
          e?.message ||
          "Failed to load permissions",
        isAdmin: false,
        permissions: new Set(),
      });
    }
  },

  can: (perm) => {
    const { isAdmin, permissions } = get();
    if (isAdmin || permissions.has("*")) return true;
    if (Array.isArray(perm)) return perm.some((p) => permissions.has(String(p).trim()));
    return permissions.has(String(perm).trim());
  },
}));
