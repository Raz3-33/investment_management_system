import { create } from "zustand";
import { api } from "../services/api";

export const useInvestorStore = create((set) => ({
  investors: [],
  investorAdd: null,
  investorUpdate: null,
  loading: false,
  error: null,
  currentInvestor: null,

  // Action to fetch all investors
  fetchInvestors: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/investors");
      set({ investors: res.data?.data || [], loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch investors",
        loading: false,
      });
    }
  },

  // Action to fetch a single investor by ID
  fetchInvestorById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/investors/${id}`);
      set({ currentInvestor: res.data?.data, loading: false });
    } catch (err) {
      set({
        error:
          err.response?.data?.message || "Failed to fetch investor details",
        loading: false,
      });
    }
  },

  // Action to add a new investor
  addInvestor: async (newInvestor) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/investors", newInvestor);
      // set({ investors: [...set.getState().investors, res.data?.data], loading: false });
      set({ investorAdd: res.data?.data, loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to add investor",
        loading: false,
      });
    }
  },

  // Action to update an existing investor
  updateInvestor: async (id, updatedInvestor) => {
    set({ loading: true, error: null });
    try {
      const res = await api.put(`/investors/${id}`, updatedInvestor);
      // set({
      //   investors: set
      //     .getState()
      //     .investors.map((investor) =>
      //       investor.id === id ? res.data?.data : investor
      //     ),
      //   loading: false,
      // });

      set({
        investorUpdate: res.data?.data,
        loading: false,
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to update investor",
        loading: false,
      });
    }
  },

  // Action to delete an investor
  deleteInvestor: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/investors/${id}`);
      set({
        investors: set
          .getState()
          .investors.filter((investor) => investor.id !== id),
        loading: false,
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to delete investor",
        loading: false,
      });
    }
  },
}));
