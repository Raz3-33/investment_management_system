import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../services/api"; // Assuming you have an API service to call backend

export const useRoleStore = create(
  persist(
    (set, get) => ({
      roles: [],
      rolesAdd: null,
      rolesRemoved:null,
      roleDetail: null,
      loadingRoleDetail: false,
      errorRoleDetail: null,
      loading: false,
      error: null,

      // Initially load the token directly from localStorage
      token: localStorage.getItem("token") ?? JSON.parse(localStorage.getItem("token")), // Directly load token from localStorage

      fetchRoles: async () => {
        const token = get().token || localStorage.getItem("token"); // Ensure token is available
        if (!token) {
          console.error("Token is missing");
          return;
        }

        set({ loading: true, error: null });
        try {
          const res = await api.get("/roles", {
            headers: {
              authorization: `Bearer ${token}`, // Attach token for authentication
            },
          });
          set({ roles: res.data, loading: false });
        } catch (err) {
          set({
            error: err.response?.data?.message || "Failed to fetch roles",
            loading: false,
          });
        }
      },

      fetchRoleDetail: async (roleId) => {
        const token = get().token || localStorage.getItem("token"); // Ensure token is available
        set({ loadingRoleDetail: true, errorRoleDetail: null });
        try {
          const res = await api.get(`/roles/role/${roleId}`, {
            headers: {
              authorization: `Bearer ${token}`, // Attach token for authentication
            },
          });
          set({ roleDetail: res.data.data });
        } catch (err) {
          set({
            errorRoleDetail:
              err.response?.data?.message || "Failed to fetch role detail",
          });
        } finally {
          set({ loadingRoleDetail: false });
        }
      },

      addRole: async (newRole) => {
        const token = get().token || localStorage.getItem("token"); // Ensure token is available
        try {
          const res = await api.post("/roles", newRole, {
            headers: {
              authorization: `Bearer ${token}`, // Attach token for authentication
            },
          });
          set((state) => ({
            rolesAdd: res.data.role,
          }));
        } catch (err) {
          set({ error: "Failed to add role" });
        }
      },

      updateRole: async (roleId, updatedRole) => {
        const token = get().token || localStorage.getItem("token"); // Ensure token is available
        try {
          const res = await api.put(`/roles/${roleId}`, updatedRole, {
            headers: {
              authorization: `Bearer ${token}`, // Attach token for authentication
            },
          });
          set((state) => ({
            rolesAdd: res.data.role,
          }));
        } catch (err) {
          set({ error: "Failed to update role" });
        }
      },

      removeRole: async (id) => {
        const token = get().token || localStorage.getItem("token"); // Ensure token is available
        try {
          await api.delete(`/roles/${id}`, {
            headers: {
              authorization: `Bearer ${token}`, // Attach token for authentication
            },
          });
          set((state) => ({
            rolesRemoved: state.roles.filter((r) => r.id !== id),
          }));
        } catch (err) {
          console.error("Delete failed", err);
        }
      },

      // Function to store the token and user info in localStorage when login is successful
      setToken: (token, user) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user)); // Save user info if needed
        set({ token });
      },

      // Function to remove token and user info when logout
      logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        set({ token: null });
      },
    }),
    {
      name: "role-store",
      partialize: (state) => ({ roles: state.roles, token: state.token }), // Persist roles and token
    }
  )
);
