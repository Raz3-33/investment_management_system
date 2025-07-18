import { create } from "zustand";
import { api } from "../services/api";

export const useBranchStore = create((set) => ({
  branches: [],
  branchAdded: null,
  branchUpdated: null,
  branchDeleted: null,
  loading: false,
  error: null,

  // Fetch branches from API
  fetchBranches: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/branches");
      set({ branches: res.data?.data, loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch branches",
        loading: false,
      });
    }
  },

  // Add a branch
  addBranch: async (newBranch) => {
    try {
      const res = await api.post("/branches", newBranch);
      set({
        branchAdded: res?.data?.data,
      });
    } catch (err) {
      console.error("Add branch failed", err);
    }
  },

  // Update a branch
  updateBranch: async (id, updatedBranch) => {
    try {
      const res = await api.put(`/branches/${id}`, updatedBranch);

      // Fetch the updated list of branches
      set({
        branchUpdated: res.data?.data, // Store the updated branch state
      });

      // Refetch the branches to get the most updated list
      await set.fetchBranches();
    } catch (err) {
      console.error("Update branch failed", err);
    }
  },

  // Delete a branch
  deleteBranch: async (id) => {
    try {
      await api.delete(`/branches/${id}`);
      set({
        branchDeleted: id, // Store the deleted branch ID
        branches: set.getState().branches.filter((branch) => branch.id !== id), // Remove the deleted branch from the list
      });
    } catch (err) {
      console.error("Delete branch failed", err);
    }
  },
}));
