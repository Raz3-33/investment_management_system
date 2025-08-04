import { create } from "zustand";
import { api } from "../services/api";

export const useDashBoardStore = create((set) => ({
  dashBoardData: null,
  loading: false,
  error: null,

  // Fetch branches from API
  fetchDashBoard: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/dashboard/findDashboard");
      set({ dashBoardData: res.data?.data, loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch branches",
        loading: false,
      });
    }
  },
}));
