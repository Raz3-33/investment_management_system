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

      setIsAdmin: (v) => set({ isAdmin: !!v }),
      setPermissions: (list) =>
        set({ permissions: new Set(list || []), loading: false }),
      reset: () =>
        set({
          loading: false,
          isAdmin: false,
          permissions: new Set(),
          error: null,
        }),

      setToken: (token) => {
        if (token) localStorage.setItem("token", token);
        else localStorage.removeItem("token");
        set({ token });
      },

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

      // inside useAuthzStore
      can: (perm) => {
        const { isAdmin, permissions } = get(); // permissions is a Set
        if (isAdmin || permissions.has("*")) return true;

        if (Array.isArray(perm)) {
          // ANY of the listed perms:
          return perm.some((p) => permissions.has(p));
          // If you want ALL, swap to: return perm.every((p) => permissions.has(p));
        }
        return permissions.has(perm);
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
