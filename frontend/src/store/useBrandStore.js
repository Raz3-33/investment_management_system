import { create } from "zustand";
import { api } from "../services/api";

export const useBrandStore = create((set, get) => ({
  brands: [],
  brandAdded: null,
  brandUpdated: null,
  brandDeleted: null,
  loading: false,
  error: null,

  // Fetch brands
  fetchBrands: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/brands");
      set({ brands: res.data?.data || [], loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch brands",
        loading: false,
      });
    }
  },

  // Add
  addBrand: async (newBrand) => {
    try {
      const res = await api.post("/brands", newBrand);
      set({ brandAdded: res?.data?.data });
      // optional: refresh list immediately
      await get().fetchBrands();
    } catch (err) {
      console.error("Add brand failed", err);
      set({ error: err.response?.data?.message || "Failed to add brand" });
    }
  },

  // Update
  updateBrand: async (id, updatedBrand) => {
    try {
      const res = await api.put(`/brands/${id}`, updatedBrand);
      set({ brandUpdated: res?.data?.data });
      await get().fetchBrands(); // <-- use get(), not set.fetchBranches
    } catch (err) {
      console.error("Update brand failed", err);
      set({ error: err.response?.data?.message || "Failed to update brand" });
    }
  },

  // Delete
  deleteBrand: async (id) => {
    try {
      await api.delete(`/brands/${id}`);
      set({
        brandDeleted: id,
        brands: get().brands.filter((b) => b.id !== id),
      });
    } catch (err) {
      console.error("Delete brand failed", err);
      set({ error: err.response?.data?.message || "Failed to delete brand" });
    }
  },
}));
