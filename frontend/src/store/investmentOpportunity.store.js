import { create } from "zustand";
import { api } from "../services/api"; // Your API service

export const useInvestmentOpportunityStore = create((set) => ({
  investmentOpportunities: [],
  addInvestmentOppurtunities:null,
  investmentOpportunityUpdate: null,
  investmentOpportunityDelete: null,
  loading: false,
  error: null,

  // Fetch all investment opportunities
  fetchInvestmentOpportunities: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/investmentOpportunity");
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

  // Add a new investment opportunity
  addInvestmentOpportunity: async (newOpportunity) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/investmentOpportunity", newOpportunity);
      set({
        // investmentOpportunities: [
        //   ...set.getState().investmentOpportunities,
        //   res.data?.data,
        // ],
        addInvestmentOppurtunities:res.data?.data,
        loading: false,
      });
    } catch (err) {
      set({
        error:
          err.response?.data?.message || "Failed to add investment opportunity",
        loading: false,
      });
    }
  },

  // Update an existing investment opportunity
  updateInvestmentOpportunity: async (id, updatedOpportunity) => {
    set({ loading: true, error: null });
    try {
      const res = await api.put(
        `/investmentOpportunity/${id}`,
        updatedOpportunity
      );

      // set({
      //   investmentOpportunities: set
      //     .getState()
      //     .investmentOpportunities.map((opp) =>
      //       opp.id === id ? res.data?.data : opp
      //     ),
      //   loading: false,
      // });

      set({
        investmentOpportunityUpdate: res.data?.data,
        loading: false,
      });
    } catch (err) {
      set({
        error:
          err.response?.data?.message ||
          "Failed to update investment opportunity",
        loading: false,
      });
    }
  },

  // Delete an investment opportunity
  deleteInvestmentOpportunity: async (id) => {
    set({ loading: true, error: null });
    try {
      let { data } = await api.delete(`/investmentOpportunity/${id}`);
      // set({
      //   investmentOpportunities: set
      //     .getState()
      //     .investmentOpportunities.filter((opp) => opp.id !== id),
      //   loading: false,
      // });

      set({
        investmentOpportunityDelete: data,
        loading: false,
      });
    } catch (err) {
      set({
        error:
          err.response?.data?.message ||
          "Failed to delete investment opportunity",
        loading: false,
      });
    }
  },
}));
