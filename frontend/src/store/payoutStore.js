import { create } from "zustand";
import { api } from "../services/api";

export const usePayoutStore = create((set) => ({
  payouts: [],
  addPayouts: null,
  editPayouts: null,
  deletePayout:null,
  loading: false, // Loading state
  error: null, // Error state

  // Fetch payouts for a specific investment
  fetchPayouts: async (investmentId) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/payouts`);
      set({ payouts: response.data.data, loading: false });
    } catch (error) {
      set({ loading: false, error: error.message });
    }
  },

  // Create a new payout
  createPayout: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post("/payouts/create", data);
      set({ addPayouts: response?.data?.data, loading: false });
      return response.data.data; // Return the created payout
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error; // Propagate error to the component
    }
  },

  // Update an existing payout
  updatePayout: async (payoutId, data) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/payouts/${payoutId}`, data);
      set({
        editPayouts: response?.data?.data,
        loading: false,
      });
      return response.data.data; // Return the updated payout
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error; // Propagate error to the component
    }
  },

  // Delete a payout
  deletePayout: async (payoutId) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/payouts/${payoutId}`);
      set({
        deletePayout: response?.data?.data,
        loading: false,
      });
    } catch (error) {
      set({ loading: false, error: error.message });
    }
  },
}));

export default usePayoutStore;
