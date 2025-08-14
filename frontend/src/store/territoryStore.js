import { create } from "zustand";
import { api } from "../services/api";

export const useTerritoryStore = create((set, get) => ({
  territories: [],
  loading: false,
  territoryAdded: null,
  territoryUpdated: null,
  territoryDeleted: null,

  resetFlags: () =>
    set({ territoryAdded: null, territoryUpdated: null, territoryDeleted: null }),

  fetchTerritories: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/territories");
      set({ territories: res.data.data || [] });
    } finally {
      set({ loading: false });
    }
  },

  addTerritory: async (payload) => {
    const res = await api.post("/territories", payload);
    set({
      territoryAdded: res.data.data,
      territories: [res.data.data, ...get().territories],
    });
    return res.data.data;
  },

  updateTerritory: async (id, payload) => {
    const res = await api.put(`/territories/${id}`, payload);
    set({
      territoryUpdated: res.data.data,
      territories: get().territories.map((t) =>
        t.id === id ? res.data.data : t
      ),
    });
    return res.data.data;
  },

  deleteTerritory: async (id) => {
    await api.delete(`/territories/${id}`);
    set({
      territoryDeleted: id,
      territories: get().territories.filter((t) => t.id !== id),
    });
  },
}));
