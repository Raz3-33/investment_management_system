import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../services/api";

export const useSalesStore = create(
  persist(
    (set) => ({
      sales: null,
      updateSales: null,
      allSales: [], // New state to hold all sales data
      loading: false,
      error: null,

      // Fetch sales for a specific opportunity
      fetchSales: async (salesId) => {
        set({ loading: true, error: null });
        try {
          const token = localStorage.getItem("token");
          const response = await api.get(`/sales/${salesId}`, {
            headers: { authorization: `Bearer ${token}` },
          });
          set({ sales: response.data.data, loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
        }
      },

      // Fetch all sales (without filtering by opportunity)
      fetchAllSales: async () => {
        set({ loading: true, error: null });
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            console.log("No authorization token found");
            set({ error: "authorization token missing", loading: false });
            return;
          }
          const response = await api.get(`/sales`, {
            headers: { authorization: `Bearer ${token}` },
          });
          console.log(response);
          set({ allSales: response.data.data, loading: false });
        } catch (err) {
          console.log("API Error: ", err);
          set({ error: err.message, loading: false });
        }
      },

      // Add a new sales entry
      addSales: async (opportunityId, data) => {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            console.log("No authorization token found");
            set({ error: "authorization token missing", loading: false });
            return;
          }
          const response = await api.post(
            `/sales`,
            { opportunityId, ...data },
            {
              headers: { authorization: `Bearer ${token}` },
            }
          );
          set({ sales: response.data.data });
        } catch (err) {
          set({ error: err.message });
        }
      },

      updateSales: async (salesId, data) => {
        try {
          const token = localStorage.getItem("token");
          const response = await api.put(`/sales/${salesId}`, data, {
            headers: { authorization: `Bearer ${token}` },
          });
          set({
            updateSales: response.data.data,
          });
        } catch (err) {
          set({ error: err.message });
        }
      },

      // Delete a sales entry
      deleteSales: async (salesId) => {
        try {
          await api.delete(`/sales/${salesId}`);
          set({ sales: state.sales.filter((sale) => sale.id !== salesId) });
        } catch (err) {
          set({ error: err.message });
        }
      },
    }),
    {
      name: "sales-store",
      partialize: (state) => ({
        sales: state.sales,
        allSales: state.allSales,
        token: state.token,
      }),
    }
  )
);
