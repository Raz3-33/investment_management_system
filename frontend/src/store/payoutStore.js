import { create } from "zustand";
import { api } from "../services/api";

export const usePayoutStore = create((set, get) => ({
  payouts: [],
  addPayouts: null,
  editPayouts: null,
  deletePayout: null,
  loading: false,
  error: null,

  _auth: () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token is required");
    return { headers: { authorization: `Bearer ${token}` } };
  },

  fetchPayouts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/payouts`, get()._auth());
      set({ payouts: response.data.data, loading: false });
    } catch (error) {
      set({ loading: false, error: error.response?.data?.message || error.message });
    }
  },

  createPayout: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post("/payouts/create", data, get()._auth());
      set({ addPayouts: response?.data?.data, loading: false });
      return response.data.data;
    } catch (error) {
      set({ loading: false, error: error.response?.data?.message || error.message });
      throw error;
    }
  },

  updatePayout: async (payoutId, data) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/payouts/${payoutId}`, data, get()._auth());
      set({ editPayouts: response?.data?.data, loading: false });
      return response.data.data;
    } catch (error) {
      set({ loading: false, error: error.response?.data?.message || error.message });
      throw error;
    }
  },

  deletePayout: async (payoutId) => {
    set({ loading: true, error: null });
    try {
      const response = await api.delete(`/payouts/${payoutId}`, get()._auth());
      set({ deletePayout: response?.data?.data, loading: false });
    } catch (error) {
      set({ loading: false, error: error.response?.data?.message || error.message });
    }
  },
}));

export default usePayoutStore;
