import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../services/api";

export const useRoleStore = create(
  persist(
    (set, get) => ({
      roles: [],
      roleDetail: null,
      loadingRoleDetail: false,
      errorRoleDetail: null,
      loading: false,
      error: null,

      fetchRoles: async () => {
        set({ loading: true, error: null });
        try {
          const res = await api.get("/roles"); // Replace with your endpoint
          set({ roles: res.data, loading: false });
        } catch (err) {
          set({
            error: err.response?.data?.message || "Failed to fetch roles",
            loading: false,
          });
        }
      },

      fetchRoleDetail: async (roleId) => {
        set({ loadingRoleDetail: true, errorRoleDetail: null });
        try {
          const res = await api.get(`/roles/role/${roleId}`);
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
    try {
      const res = await api.post("/roles", newRole); // API POST
      set((state) => ({
        roles: [...state.roles, res.data.role],
      }));
    } catch (err) {
      set({ error: "Failed to add role" });
    }
  },
      updateRole: async (roleId, updatedRole) => {
        try {
          const res = await api.put(`/roles/${roleId}`, updatedRole); // API PUT for update
          set((state) => ({
            roles: state.roles.map((role) =>
              role.id === roleId ? res.data.role : role
            ),
          }));
        } catch (err) {
          set({ error: "Failed to update role" });
        }
      },

      removeRole: async (id) => {
        try {
          await api.delete(`/roles/${id}`); // Adjust as per your backend
          set((state) => ({
            roles: state.roles.filter((r) => r.id !== id),
          }));
        } catch (err) {
          console.error("Delete failed", err);
        }
      },
    }),
    {
      name: "role-store",
      partialize: (state) => ({ roles: state.roles }), // persist only roles
    }
  )
);
