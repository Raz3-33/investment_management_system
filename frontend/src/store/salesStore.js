import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../services/api";

export const useSalesStore = create(
  persist(
    (set, get) => ({
      sales: null,
      updateSales: null, // (note: name collides with method below—rename if you prefer)
      allSales: [],
      loading: false,
      error: null,

      _auth: () => {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token is required");
        return { headers: { authorization: `Bearer ${token}` } };
      },

      fetchSales: async (salesId) => {
        set({ loading: true, error: null });
        try {
          const response = await api.get(`/sales/${salesId}`, get()._auth());
          set({ sales: response.data.data, loading: false });
        } catch (err) {
          set({ error: err.response?.data?.message || err.message, loading: false });
        }
      },

      fetchAllSales: async () => {
        set({ loading: true, error: null });
        try {
          const response = await api.get(`/sales`, get()._auth());
          set({ allSales: response.data.data, loading: false });
        } catch (err) {
          set({ error: err.response?.data?.message || err.message, loading: false });
        }
      },

      addSales: async (opportunityId, data) => {
        try {
          const response = await api.post(`/sales`, { opportunityId, ...data }, get()._auth());
          set({ sales: response.data.data });
        } catch (err) {
          set({ error: err.response?.data?.message || err.message });
        }
      },

      updateSalesRequest: async (salesId, data) => {
        try {
          const response = await api.put(`/sales/${salesId}`, data, get()._auth());
          set({ updateSales: response.data.data });
        } catch (err) {
          set({ error: err.response?.data?.message || err.message });
        }
      },

      deleteSales: async (salesId) => {
        try {
          await api.delete(`/sales/${salesId}`, get()._auth());
          set((s) => ({
            sales: Array.isArray(s.sales) ? s.sales.filter((x) => x.id !== salesId) : s.sales,
          })); // ✅ fixed
        } catch (err) {
          set({ error: err.response?.data?.message || err.message });
        }
      },
    }),
    {
      name: "sales-store",
      partialize: (state) => ({
        sales: state.sales,
        allSales: state.allSales,
      }),
    }
  )
);
