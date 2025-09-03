import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../services/api";

export const useInvestmentOpportunityStore = create(
  persist(
    (set, get) => ({
      investmentOpportunities: [],
      investmentOpportunity: null,
      investmentOpportunitiesWithBranch: [],
      addInvestmentOppurtunities: null,
      investmentOpportunityUpdate: null,
      investmentOpportunityDelete: null,
      loading: false,
      error: null,
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

      fetchInvestmentOpportunities: async () => {
        set({ loading: true, error: null });
        try {
          const res = await api.get(
            "/investmentOpportunity",
            get()._getAuth()
          );
          set({ investmentOpportunities: res.data?.data || [], loading: false });
        } catch (err) {
          set({
            error:
              err.response?.data?.message ||
              "Failed to fetch investment opportunities",
            loading: false,
          });
        }
      },

      fetchInvestmentsById: async (id) => {
        set({ loading: true, error: null });
        try {
          const res = await api.get(
            `/investmentOpportunity/${id}`,
            get()._getAuth()
          );
          set({ investmentOpportunity: res.data?.data || [], loading: false });
        } catch (err) {
          set({
            error:
              err.response?.data?.message ||
              "Failed to fetch investment opportunities",
            loading: false,
          });
        }
      },

      addInvestmentOpportunity: async (newOpportunity) => {
        set({ loading: true, error: null });
        try {
          const res = await api.post(
            "/investmentOpportunity",
            newOpportunity,
            get()._getAuth()
          );
          set({ addInvestmentOppurtunities: res.data?.data, loading: false });
        } catch (err) {
          set({
            error:
              err.response?.data?.message ||
              "Failed to add investment opportunity",
            loading: false,
          });
        }
      },

      updateInvestmentOpportunity: async (id, updatedOpportunity) => {
        set({ loading: true, error: null });
        try {
          const res = await api.put(
            `/investmentOpportunity/${id}`,
            updatedOpportunity,
            get()._getAuth()
          );
          set({ investmentOpportunityUpdate: res.data?.data, loading: false });
        } catch (err) {
          set({
            error:
              err.response?.data?.message ||
              "Failed to update investment opportunity",
            loading: false,
          });
        }
      },

      deleteInvestmentOpportunity: async (id) => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.delete(
            `/investmentOpportunity/${id}`,
            get()._getAuth()
          );
          set({ investmentOpportunityDelete: data, loading: false });
        } catch (err) {
          set({
            error:
              err.response?.data?.message ||
              "Failed to delete investment opportunity",
            loading: false,
          });
        }
      },

      fetchInvestmentOpportunityWithBranches: async (opportunityId) => {
        set({ loading: true, error: null });
        try {
          const response = await api.get(
            `/investmentOpportunity/opportunityBranches/${opportunityId}`,
            get()._getAuth()
          );
          set({
            investmentOpportunitiesWithBranch: response.data.data,
            loading: false,
          });
        } catch (err) {
          set({
            error:
              err.response?.data?.message ||
              "Failed to fetch opportunity with branches",
            loading: false,
          });
        }
      },
    }),
    {
      name: "investment-opportunity-store",
      partialize: (s) => ({
        investmentOpportunities: s.investmentOpportunities,
        token: s.token,
      }),
    }
  )
);
