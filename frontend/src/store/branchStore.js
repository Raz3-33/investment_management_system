import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../services/api";

export const useBranchStore = create(
  persist(
    (set, get) => ({
      branches: [],
      branchAdded: null,
      branchUpdated: null,
      branchDeleted: null,
      loading: false,
      error: null,
      token:
        localStorage.getItem("token") ??
        JSON.parse(localStorage.getItem("token")), // same as role store

      setToken: (token, user) => {
        localStorage.setItem("token", token);
        if (user) localStorage.setItem("user", JSON.stringify(user));
        set({ token });
      },
      logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        set({ token: null });
      },

      // helper
      _getAuth: () => {
        const token =
          get().token ||
          localStorage.getItem("token") ||
          JSON.parse(localStorage.getItem("token"));
        if (!token) throw new Error("Token is required");
        return { headers: { authorization: `Bearer ${token}` } };
      },

      fetchBranches: async () => {
        set({ loading: true, error: null });
        try {
          const res = await api.get("/branches", get()._getAuth());
          set({ branches: res.data?.data, loading: false });
        } catch (err) {
          set({
            error: err.response?.data?.message || "Failed to fetch branches",
            loading: false,
          });
        }
      },

      addBranch: async (newBranch) => {
        try {
          const res = await api.post("/branches", newBranch, get()._getAuth());
          set({ branchAdded: res?.data?.data });
          await get().fetchBranches();
        } catch (err) {
          console.error("Add branch failed", err);
          set({ error: err.response?.data?.message || "Failed to add branch" });
        }
      },

      updateBranch: async (id, updatedBranch) => {
        try {
          const res = await api.put(
            `/branches/${id}`,
            updatedBranch,
            get()._getAuth()
          );
        set({ branchUpdated: res.data?.data });
          await get().fetchBranches();
        } catch (err) {
          console.error("Update branch failed", err);
          set({
            error: err.response?.data?.message || "Failed to update branch",
          });
        }
      },

      deleteBranch: async (id) => {
        try {
          await api.delete(`/branches/${id}`, get()._getAuth());
          set({
            branchDeleted: id,
            branches: get().branches.filter((b) => b.id !== id),
          });
        } catch (err) {
          console.error("Delete branch failed", err);
          set({
            error: err.response?.data?.message || "Failed to delete branch",
          });
        }
      },
    }),
    {
      name: "branch-store",
      partialize: (s) => ({ branches: s.branches, token: s.token }),
    }
  )
);
