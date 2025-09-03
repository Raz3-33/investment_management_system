import { create } from "zustand";
import { api } from "../services/api";

export const useTerritoryStore = create((set, get) => ({
  territories: [],
  loading: false,
  territoryAdded: null,
  territoryUpdated: null,
  territoryDeleted: null,

  resetFlags: () => set({ territoryAdded: null, territoryUpdated: null, territoryDeleted: null }),

  _auth: () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token is required");
    return { headers: { authorization: `Bearer ${token}` } };
  },

  fetchTerritories: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/territories", get()._auth());
      set({ territories: res.data.data || [] });
    } finally {
      set({ loading: false });
    }
  },

  addTerritory: async (payload) => {
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("region", payload.region);
    formData.append("opportunityId", payload.opportunityId);
    formData.append("assignmentType", payload.assignmentType);
    formData.append("locations", JSON.stringify(payload.locations.map((l) => ({ name: l.name }))));
    formData.append("pincodes", JSON.stringify(payload.pincodes.map((p) => ({ code: p.code, city: p.city }))));

    payload.locations.forEach((loc) => loc.image && formData.append("locationImages", loc.image, loc.image.name));
    payload.pincodes.forEach((pin) => pin.image && formData.append("pincodeImages", pin.image, pin.image.name));

    const res = await api.post("/territories", formData, {
      ...get()._auth(),
      headers: { ...get()._auth().headers, "Content-Type": "multipart/form-data" },
    });

    set({
      territoryAdded: res.data.data,
      territories: [res.data.data, ...get().territories],
    });
    return res.data.data;
  },

  updateTerritory: async (id, payload) => {
    const formData = new FormData();

    if (payload.opportunityId) formData.append("opportunityId", payload.opportunityId);
    if (payload.assignmentType) formData.append("assignmentType", payload.assignmentType);

    if (payload.assignmentType === "Manually") {
      const loc = Array.isArray(payload.locations) ? payload.locations[0] : null;
      if (loc?.name) formData.append("locationName", loc.name);
      if (loc?.image instanceof File) formData.append("image", loc.image, loc.image.name);
      else if (typeof loc?.image === "string" && loc.image) formData.append("imageUrl", loc.image);
    }

    if (payload.assignmentType === "Automatically") {
      const pin = Array.isArray(payload.pincodes) ? payload.pincodes[0] : null;
      if (pin?.code) formData.append("pincode", pin.code);
      if (pin?.city) formData.append("city", pin.city);
      if (pin?.image instanceof File) formData.append("image", pin.image, pin.image.name);
      else if (typeof pin?.image === "string" && pin.image) formData.append("imageUrl", pin.image);
    }

    if (payload.removeImage === true) formData.append("removeImage", "true");

    const res = await api.put(`/territories/${id}`, formData, {
      ...get()._auth(),
      headers: { ...get()._auth().headers, "Content-Type": "multipart/form-data" },
    });

    set({
      territoryUpdated: res.data.data,
      territories: get().territories.map((t) => (t.id === id ? res.data.data : t)),
    });
    return res.data.data;
  },

  deleteTerritory: async (id) => {
    await api.delete(`/territories/${id}`, get()._auth());
    set({
      territoryDeleted: id,
      territories: get().territories.filter((t) => t.id !== id),
    });
  },
}));
