import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../services/api";

export const useInvestorStore = create(
  persist(
    (set, get) => ({
      investors: [],
      investorAdd: null,
      investorUpdate: null,
      loading: false,
      error: null,
      currentInvestor: null,
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

      fetchInvestors: async () => {
        set({ loading: true, error: null });
        try {
          const res = await api.get("/investors", get()._getAuth());
          set({ investors: res.data?.data || [], loading: false });
        } catch (err) {
          set({
            error: err.response?.data?.message || "Failed to fetch investors",
            loading: false,
          });
        }
      },

      fetchInvestorById: async (id) => {
        set({ loading: true, error: null });
        try {
          const res = await api.get(`/investors/${id}`, get()._getAuth());
          set({ currentInvestor: res.data?.data, loading: false });
        } catch (err) {
          set({
            error:
              err.response?.data?.message ||
              "Failed to fetch investor details",
            loading: false,
          });
        }
      },

      addInvestor: async (newInvestor) => {
        set({ loading: true, error: null });
        try {
          const res = await api.post("/investors", newInvestor, get()._getAuth());
          set({ investorAdd: res.data?.data, loading: false });
        } catch (err) {
          set({
            error: err.response?.data?.message || "Failed to add investor",
            loading: false,
          });
        }
      },

      updateInvestor: async (id, updatedInvestor) => {
        set({ loading: true, error: null });
        try {
          const res = await api.put(
            `/investors/${id}`,
            updatedInvestor,
            get()._getAuth()
          );
          set({ investorUpdate: res.data?.data, loading: false });
        } catch (err) {
          set({
            error: err.response?.data?.message || "Failed to update investor",
            loading: false,
          });
        }
      },

      deleteInvestor: async (id) => {
        set({ loading: true, error: null });
        try {
          await api.delete(`/investors/${id}`, get()._getAuth());
          set({
            investors: get().investors.filter((i) => i.id !== id),
            loading: false,
          });
        } catch (err) {
          set({
            error: err.response?.data?.message || "Failed to delete investor",
            loading: false,
          });
        }
      },
    }),
    {
      name: "investor-store",
      partialize: (s) => ({ investors: s.investors, token: s.token }),
    }
  )
);
