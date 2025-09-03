import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../services/api";

export const useInvestmentStore = create(
  persist(
    (set, get) => ({
      investments: [],
      loading: false,
      error: null,
      investmentAdded: null,
      investmentUpdated: null,
      investmentDeleted: null,
      token:
        localStorage.getItem("token") ??
        JSON.parse(localStorage.getItem("token")),

      setToken: (token, user) => {
        localStorage.setItem("token", token);
        if (user) localStorage.setItem("user", JSON.stringify(user));
        set({ token });
      },
      logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        set({ token: null });
      },
      _getAuth: () => {
        const token =
          get().token ||
          localStorage.getItem("token") ||
          JSON.parse(localStorage.getItem("token"));
        if (!token) throw new Error("Token is required");
        return { headers: { authorization: `Bearer ${token}` } };
      },

      fetchInvestments: async () => {
        set({ loading: true, error: null });
        try {
          const response = await api.get("/investments", get()._getAuth());
          set({ investments: response.data.data, loading: false });
        } catch (err) {
          set({
            error: err.response?.data?.message || "Failed to fetch investments",
            loading: false,
          });
        }
      },

      addInvestment: async (investmentData) => {
        set({ loading: true, error: null });
        try {
          const response = await api.post(
            "/investments",
            investmentData,
            get()._getAuth()
          );
          set({ investmentAdded: response.data.data, loading: false });
        } catch (err) {
          set({
            error: err.response?.data?.message || "Failed to add investment",
            loading: false,
          });
        }
      },

      updateInvestment: async (id, updatedData) => {
        set({ loading: true, error: null });
        try {
          const response = await api.put(
            `/investments/${id}`,
            updatedData,
            get()._getAuth()
          );
          set({
            investments: get()
              .investments.map((inv) =>
                inv.id === id ? response.data.data : inv
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

      deleteInvestment: async (id) => {
        set({ loading: true, error: null });
        try {
          await api.delete(`/investments/${id}`, get()._getAuth());
          set({ investmentDeleted: id, loading: false });
        } catch (err) {
          set({
            error: err.response?.data?.message || "Failed to delete investment",
            loading: false,
          });
        }
      },
    }),
    {
      name: "investment-store",
      partialize: (s) => ({ investments: s.investments, token: s.token }),
    }
  )
);
