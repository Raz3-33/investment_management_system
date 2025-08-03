import { create } from "zustand";
import { api } from "../services/api"; // Your API service

export const useSettingStore = create((set) => ({
  // State management for both businessCategory and investmentType
  businessCategories: [],
  investmentTypes: [],
  businessCategoriesAdded:null,
  investmentTypesAdded:null,
  updateInvestmentTypes:null,
  loading: false,
  error: null,

  // Fetch business categories
  fetchBusinessCategories: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/settings/business-categories"); // Adjust according to your backend route
      set({
        businessCategories: res.data?.data || [],
        loading: false,
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch business categories",
        loading: false,
      });
    }
  },

  // Fetch investment types
  fetchInvestmentTypes: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/settings/investment-types"); // Adjust according to your backend route
      set({
        investmentTypes: res.data?.data || [],
        loading: false,
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch investment types",
        loading: false,
      });
    }
  },

  // Add a new business category
  addBusinessCategory: async (newCategory) => {
    try {
      const res = await api.post("/settings/business-categories", newCategory); // Adjust route
      set({
        businessCategoriesAdded: res.data?.data, // Add to state
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to add business category",
        loading: false,
      });
    }
  },

  // Add a new investment type
  addInvestmentType: async (newType) => {
    try {
      const res = await api.post("/settings/investment-types", newType); // Adjust route
      set({
        // investmentTypes: [...set.getState().investmentTypes, res.data?.data], // Add to state
        investmentTypesAdded:res.data?.data,
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to add investment type",
        loading: false,
      });
    }
  },

  // Update a business category
  updateBusinessCategory: async (id, updatedCategory) => {
    try {
      const res = await api.put(`/settings/business-categories/${id}`, updatedCategory); // Adjust route
      set({
        businessCategories: set.getState().businessCategories.map((category) =>
          category.id === id ? res.data?.data : category
        ),
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to update business category",
        loading: false,
      });
    }
  },

  // Update an investment type
  updateInvestmentType: async (id, updatedType) => {
    try {
      const res = await api.put(`/settings/investment-types/${id}`, updatedType); // Adjust route
      set({
        // investmentTypes: set.getState().investmentTypes.map((type) =>
        //   type.id === id ? res.data?.data : type
        // ),
        updateInvestmentTypes:res.data?.data
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to update investment type",
        loading: false,
      });
    }
  },

  // Delete a business category
  deleteBusinessCategory: async (id) => {
    try {
      await api.delete(`/settings/business-categories/${id}`); // Adjust route
      set({
        businessCategories: set
          .getState()
          .businessCategories.filter((category) => category.id !== id), // Remove from state
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to delete business category",
        loading: false,
      });
    }
  },

  // Delete an investment type
  deleteInvestmentType: async (id) => {
    try {
      await api.delete(`/settings/investment-types/${id}`); // Adjust route
      set({
        investmentTypes: set
          .getState()
          .investmentTypes.filter((type) => type.id !== id), // Remove from state
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to delete investment type",
        loading: false,
      });
    }
  },
}));
