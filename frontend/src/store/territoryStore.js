import { create } from "zustand";
import { api } from "../services/api";

export const useTerritoryStore = create((set, get) => ({
  territories: [],
  loading: false,
  territoryAdded: null,
  territoryUpdated: null,
  territoryDeleted: null,

  resetFlags: () =>
    set({
      territoryAdded: null,
      territoryUpdated: null,
      territoryDeleted: null,
    }),

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
    // Create FormData
    const formData = new FormData();

    // Append normal fields
    for (const key in payload) {
      if (
        key !== "locationFiles" &&
        key !== "pincodeFiles" &&
        key !== "locations" &&
        key !== "pincodes"
      ) {
        // For non-array/simple fields
        formData.append(key, payload[key]);
      }
    }

    // Append locations as JSON string for parsing server-side
    if (Array.isArray(payload.locations)) {
      formData.append("locations", JSON.stringify(payload.locations));
    }

    // Append pincodes as JSON string
    if (Array.isArray(payload.pincodes)) {
      formData.append("pincodes", JSON.stringify(payload.pincodes));
    }

    // Append location images - expect payload.locationFiles as array of File objects
    if (payload.locationFiles && payload.locationFiles.length > 0) {
      payload.locationFiles.forEach((file, idx) => {
        formData.append("locationImages", file, file.name);
      });
    }

    // Append pincode images - expect payload.pincodeFiles as array of File objects
    if (payload.pincodeFiles && payload.pincodeFiles.length > 0) {
      payload.pincodeFiles.forEach((file, idx) => {
        formData.append("pincodeImages", file, file.name);
      });
    }

    // Axios post with multipart/form-data (Content-Type set automatically)
    const res = await api.post("/territories", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

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
