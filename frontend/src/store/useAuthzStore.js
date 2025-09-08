// src/stores/useAuthzStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../services/api";

export const useAuthzStore = create()(
  persist(
    (set, get) => ({
      loading: false,
      isAdmin: false,
      permissions: new Set(),
      error: null,
      token: localStorage.getItem("token") ?? null,

      setToken: (token) => {
        if (token) localStorage.setItem("token", token);
        else localStorage.removeItem("token");
        set({ token });
      },

      bootstrap: async () => {
        const token = get().token ?? localStorage.getItem("token");
        if (!token) {
          set({
            isAdmin: false,
            permissions: new Set(),
            lastLoadedAt: Date.now(),
          });
          return;
        }
        set({ loading: true, error: null });
        try {
          const res = await api.get("/me/permissions", {
            headers: { authorization: `Bearer ${token}` },
          });
          const { isAdmin, permissions } = res.data || {};
          set({
            isAdmin: Boolean(isAdmin),
            permissions: new Set(permissions || []),
            lastLoadedAt: Date.now(),
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
        return isAdmin || permissions.has("*") || permissions.has(perm);
      },

      clear: () => set({ isAdmin: false, permissions: new Set(), error: null }),
    }),
    {
      name: "authz-store",
      partialize: (s) => ({
        isAdmin: s.isAdmin,
        // Persisting permissions is optional. If you prefer fresh fetch on reload, omit this line.
        permissions: Array.from(s.permissions ?? []),
        lastLoadedAt: s.lastLoadedAt,
        token: s.token,
      }),
      // rehydrate permissions array back to Set
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const arr = state.permissions;
        if (Array.isArray(arr)) {
          state.permissions = new Set(arr);
        }
      },
    }
  )
);
