// src/store/useAuthzStore.ts
import { create } from "zustand";
import { api } from "../services/api";


export const useAuthzStore = create()((set, get) => ({
  loading: false,
  isAdmin: false,
  permissions: new Set(),
  error: null,

  setIsAdmin: (v) => set({ isAdmin: !!v }),
  setPermissions: (list) => set({ permissions: new Set(list || []), loading: false }),
  reset: () => set({ loading: false, isAdmin: false, permissions: new Set(), error: null }),

  bootstrap: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      set({ isAdmin: false, permissions: new Set(), loading: false });
      return;
    }
    set({ loading: true, error: null });
    try {
      const res = await api.get("/me/permissions", {
        headers: { authorization: `Bearer ${token}` },
      });
      const { isAdmin, permissions } = res.data || {};
      set({
        isAdmin: !!isAdmin,
        permissions: new Set(permissions || []),
        loading: false,
      });
    } catch (e) {
      set({
        loading: false,
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
    if (Array.isArray(perm)) return perm.some((p) => permissions.has(p));
    return permissions.has(perm);
  },
}));
