import { create } from "zustand";
import { api } from "../services/api";

export const useBrandStore = create((set, get) => ({
  brands: [],
  brandAdded: null,
  brandUpdated: null,
  brandDeleted: null,
  loading: false,
  error: null,

  _auth: () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token is required");
    return { headers: { authorization: `Bearer ${token}` } };
  },

  fetchBrands: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/brands", get()._auth());
      set({ brands: res.data?.data || [], loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch brands",
        loading: false,
      });
    }
  },

  addBrand: async (newBrand) => {
    try {
      const res = await api.post("/brands", newBrand, get()._auth());
      set({ brandAdded: res?.data?.data });
      await get().fetchBrands();
    } catch (err) {
      console.error("Add brand failed", err);
      set({ error: err.response?.data?.message || "Failed to add brand" });
    }
  },

  updateBrand: async (id, updatedBrand) => {
    try {
      const res = await api.put(`/brands/${id}`, updatedBrand, get()._auth());
      set({ brandUpdated: res?.data?.data });
      await get().fetchBrands();
    } catch (err) {
      console.error("Update brand failed", err);
      set({ error: err.response?.data?.message || "Failed to update brand" });
    }
  },

  deleteBrand: async (id) => {
    try {
      await api.delete(`/brands/${id}`, get()._auth());
      set({ brandDeleted: id, brands: get().brands.filter((b) => b.id !== id) });
    } catch (err) {
      console.error("Delete brand failed", err);
      set({ error: err.response?.data?.message || "Failed to delete brand" });
    }
  },
}));
