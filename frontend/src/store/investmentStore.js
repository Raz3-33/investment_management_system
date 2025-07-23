import { create } from "zustand";
import { api } from "../services/api";

export const useInvestmentStore = create((set) => ({
  investments: [],
  loading: false,
  error: null,
  investmentAdded: null,
  investmentUpdated: null,
  investmentDeleted: null,

  // Fetch all investments
  fetchInvestments: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get("/investments"); // Fetch all investments
      set({
        investments: response.data.data,
        loading: false,
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch investments",
        loading: false,
      });
    }
  },

  // Add a new investment
  addInvestment: async (investmentData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post("/investments", investmentData); // Send data to backend
      set({
        investments: [...set.getState().investments, response.data.data], // Add new investment to state
        investmentAdded: response.data.data,
        loading: false,
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to add investment",
        loading: false,
      });
    }
  },

  // Update an investment
  updateInvestment: async (id, updatedData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/investments/${id}`, updatedData); // Send updated data
      set({
        investments: set
          .getState()
          .investments.map((investment) =>
            investment.id === id ? response.data.data : investment
          ),
        investmentUpdated: response.data.data,
        loading: false,
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to update investment",
        loading: false,
      });
    }
  },

  // Delete an investment
  deleteInvestment: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/investments/${id}`); // Send request to delete investment
      set({
        investments: set
          .getState()
          .investments.filter((investment) => investment.id !== id), // Remove investment from state
        investmentDeleted: id,
        loading: false,
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to delete investment",
        loading: false,
      });
    }
  },
}));
