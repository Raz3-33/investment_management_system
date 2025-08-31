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
    // Prepare FormData
    const formData = new FormData();

    // Add basic fields
    formData.append("name", payload.name);
    formData.append("region", payload.region);
    formData.append("opportunityId", payload.opportunityId);
    formData.append("assignmentType", payload.assignmentType);

    // Add locations metadata as JSON string
    formData.append(
      "locations",
      JSON.stringify(
        payload.locations.map((loc) => ({
          name: loc.name,
          // image will be handled separately
        }))
      )
    );

    // Add pincodes metadata as JSON string
    formData.append(
      "pincodes",
      JSON.stringify(
        payload.pincodes.map((pin) => ({
          code: pin.code,
          city: pin.city,
          // image handled separately
        }))
      )
    );

    // Add location images (must be File objects)
    payload.locations.forEach((loc) => {
      if (loc.image)
        formData.append("locationImages", loc.image, loc.image.name);
    });

    // Add pincode images (must be File objects)
    payload.pincodes.forEach((pin) => {
      if (pin.image)
        formData.append("pincodeImages", pin.image, pin.image.name);
    });

    // Send request
    const res = await api.post("/territories", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    set({
      territoryAdded: res.data.data,
      territories: [res.data.data, ...get().territories],
    });
    return res.data.data;
  },

  // store/territoryStore.ts (or .js)
  updateTerritory: async (id, payload) => {
    // payload has same shape you build in the modal:
    // {
    //   name, region, opportunityId, assignmentType, locations: [{name, image}], pincodes: [{code, city, image}], city
    // }
    const formData = new FormData();

    // Basic fields (optional name/region depending on your schema)
    // when building FormData
    if (payload.opportunityId)
      formData.append("opportunityId", payload.opportunityId);
    if (payload.assignmentType)
      formData.append("assignmentType", payload.assignmentType);

    if (payload.assignmentType === "Manually") {
      const loc = Array.isArray(payload.locations)
        ? payload.locations[0]
        : null;
      if (loc?.name) formData.append("locationName", loc.name);
      if (loc?.image instanceof File) {
        formData.append("image", loc.image, loc.image.name);
      } else if (typeof loc?.image === "string" && loc.image) {
        formData.append("imageUrl", loc.image);
      }
    }

    if (payload.assignmentType === "Automatically") {
      const pin = Array.isArray(payload.pincodes) ? payload.pincodes[0] : null;
      if (pin?.code) formData.append("pincode", pin.code);
      if (pin?.city) formData.append("city", pin.city);
      if (pin?.image instanceof File) {
        formData.append("image", pin.image, pin.image.name);
      } else if (typeof pin?.image === "string" && pin.image) {
        formData.append("imageUrl", pin.image);
      }
    }

    if (payload.removeImage === true) {
      formData.append("removeImage", "true");
    }

    const res = await api.put(`/territories/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

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
