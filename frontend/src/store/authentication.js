// src/store/authentication.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../services/api";
import { useAuthzStore } from "./useAuthzStore";

// optional: normalize permissions coming from API
const pickPermissions = (payload) => {
  // try common shapes: data.permissions, data.user.role.permissions -> names
  const fromTop = payload?.permissions;
  if (Array.isArray(fromTop)) return fromTop;

  const rolePerms = payload?.user?.role?.permissions;
  if (Array.isArray(rolePerms)) {
    // rolePerms could be [{ permission: { name }, access }, ...] or just strings
    return rolePerms
      .map((rp) =>
        typeof rp === "string" ? rp : rp?.permission?.name || rp?.name || null
      )
      .filter(Boolean);
  }
  return [];
};

export const useAuthStore = create()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      permissions: [],
      loading: false,
      error: null,

      /** Call on login form submit */
      // login: async (credentials) => {
      //   set({ loading: true, error: null });
      //   try {
      //     const res = await api.post("/auth/login", credentials);
      //     const payload = res?.data?.data || {};
      //     const token = payload.token || null;
      //     const user = payload.user || null;
      //     const permissions = pickPermissions(payload);

      //     // Keep axios in sync
      //     if (token) {
      //       api.defaults.headers.common.authorization = `Bearer ${token}`;
      //     } else {
      //       delete api.defaults.headers.common.authorization;
      //     }

      //     // (Optional) keep backward compatibility for other stores that read these keys
      //     if (token) localStorage.setItem("token", token);
      //     else localStorage.removeItem("token");

      //     localStorage.setItem("user", JSON.stringify(user || null));

      //     set({
      //       token,
      //       user,
      //       permissions,
      //       loading: false,
      //       error: null,
      //       loginDetails: res.data?.data,
      //     });
      //     return { ok: true, token, user, permissions };
      //   } catch (err) {
      //     const msg = err?.response?.data?.message || "Login failed";
      //     delete api.defaults.headers.common.authorization;
      //     localStorage.removeItem("token");
      //     localStorage.removeItem("user");
      //     set({
      //       loading: false,
      //       error: msg,
      //       token: null,
      //       user: null,
      //       permissions: [],
      //     });
      //     return { ok: false, error: msg };
      //   }
      // },

      // useAuthStore login (only the important parts)
      login: async (credentials) => {
        set({ loading: true, error: null });
        try {
          const res = await api.post("/auth/login", credentials);
          const payload = res?.data?.data || {};
          const token = payload.token || null;
          const user = payload.user || null;
          const permsArray = pickPermissions(payload);

          // Keep axios in sync
          if (token)
            api.defaults.headers.common.authorization = `Bearer ${token}`;
          else delete api.defaults.headers.common.authorization;

          // Optional legacy storage
          if (token) localStorage.setItem("token", token);
          else localStorage.removeItem("token");
          localStorage.setItem("user", JSON.stringify(user || null));

          // Update this store
          set({
            token,
            user,
            loading: false,
            error: null,
            loginDetails: payload,
          });

          // 🔑 Bridge once into authZ store (no subscribing between stores!)
          const authz = useAuthzStore.getState();
          authz.setIsAdmin(Boolean(user?.isAdmin)); // or from payload
          authz.setPermissions(permsArray); // array -> Set inside

          return { ok: true, token, user, permissions: permsArray };
        } catch (err) {
          const msg = err?.response?.data?.message || "Login failed";
          delete api.defaults.headers.common.authorization;
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          set({ loading: false, error: msg, token: null, user: null });

          // Clear authZ as well
          useAuthzStore.getState().reset();

          return { ok: false, error: msg };
        }
      },

      /** Directly set auth (e.g., after refreshing a session) */
      setAuth: ({ user, token, permissions = [] }) => {
        if (token) {
          api.defaults.headers.common.authorization = `Bearer ${token}`;
          localStorage.setItem("token", token);
        } else {
          delete api.defaults.headers.common.authorization;
          localStorage.removeItem("token");
        }

        useAuthzStore.getState().setPermissions(permissions);
        localStorage.setItem("user", JSON.stringify(user || null));
        set({ user: user || null, token: token || null, permissions });
      },

      /** Clear everything */
      logout: () => {
        delete api.defaults.headers.common.authorization;
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        set({ user: null, token: null });

        useAuthzStore.getState().reset();
      },

      /** Convenience for other stores making requests */
      getAuthHeader: () => {
        const t = get().token || localStorage.getItem("token");
        return t ? { headers: { authorization: `Bearer ${t}` } } : {};
      },
    }),
    {
      name: "auth-store",
      // persist only what matters for auth
      partialize: (s) => ({
        user: s.user,
        token: s.token,
        permissions: s.permissions,
      }),
      // after rehydrate, restore axios header from persisted token
      onRehydrateStorage: () => (state) => {
        const token = state?.token || localStorage.getItem("token"); // keep compatibility
        if (token) {
          api.defaults.headers.common.authorization = `Bearer ${token}`;
        } else {
          delete api.defaults.headers.common.authorization;
        }
      },
    }
  )
);
