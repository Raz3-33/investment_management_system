import { create } from "zustand";
import { api } from "../services/api";

export const useSettingStore = create((set, get) => ({
  businessCategories: [],
  investmentTypes: [],
  businessCategoriesAdded: null,
  investmentTypesAdded: null,
  updateInvestmentTypes: null,
  loading: false,
  error: null,

  _auth: () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token is required");
    return { headers: { authorization: `Bearer ${token}` } };
  },

  fetchBusinessCategories: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/settings/business-categories", get()._auth());
      set({ businessCategories: res.data?.data || [], loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch business categories",
        loading: false,
      });
    }
  },

  fetchInvestmentTypes: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/settings/investment-types", get()._auth());
      set({ investmentTypes: res.data?.data || [], loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch investment types",
        loading: false,
      });
    }
  },

  addBusinessCategory: async (newCategory) => {
    try {
      const res = await api.post("/settings/business-categories", newCategory, get()._auth());
      set({ businessCategoriesAdded: res.data?.data });
      await get().fetchBusinessCategories();
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to add business category",
        loading: false,
      });
    }
  },

  addInvestmentType: async (newType) => {
    try {
      const res = await api.post("/settings/investment-types", newType, get()._auth());
      set({ investmentTypesAdded: res.data?.data });
      await get().fetchInvestmentTypes();
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to add investment type",
        loading: false,
      });
    }
  },

  updateBusinessCategory: async (id, updatedCategory) => {
    try {
      const res = await api.put(`/settings/business-categories/${id}`, updatedCategory, get()._auth());
      set({
        businessCategories: get().businessCategories.map((c) => (c.id === id ? res.data?.data : c)),
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to update business category",
        loading: false,
      });
    }
  },

  updateInvestmentType: async (id, updatedType) => {
    try {
      const res = await api.put(`/settings/investment-types/${id}`, updatedType, get()._auth());
      set({ updateInvestmentTypes: res.data?.data });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to update investment type",
        loading: false,
      });
    }
  },

  deleteBusinessCategory: async (id) => {
    try {
      await api.delete(`/settings/business-categories/${id}`, get()._auth());
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to delete business category",
        loading: false,
      });
    }
  },

  deleteInvestmentType: async (id) => {
    try {
      await api.delete(`/settings/investment-types/${id}`, get()._auth());
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to delete investment type",
        loading: false,
      });
    }
  },
}));
