import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../services/api";

// ---- Single source of truth for initial state
export const initialProfileState = {
  users: null,       // can be { ...user } or { data: { ...user } }
  loading: false,
  error: null,
};

export const useProfileStore = create(
  persist(
    (set, get) => ({
      ...initialProfileState,

      // Fetch users from API
      fetchProfiles: async () => {
        set({ loading: true, error: null });
        try {
          const user = JSON.parse(localStorage.getItem("user"));
          const id = user?.id;
          const res = await api.get("/profile/findUsers", { params: { id } });
          set({ users: res.data?.data ?? res.data, loading: false });
        } catch (err) {
          set({
            error: err?.response?.data?.message || "Failed to fetch users",
            loading: false,
          });
        }
      },

      // Update password
      updatePassword: async ({ currentPassword, newPassword }) => {
        set({ loading: true, error: null });
        try {
          const user = JSON.parse(localStorage.getItem("user"));
          const userId = user?.id;
          const res = await api.put("/profile/updatePassword", {
            userId,
            currentPassword,
            newPassword,
          });
          set({ loading: false });
          return {
            success: true,
            message: res?.data?.message || "Password updated successfully",
          };
        } catch (err) {
          const message =
            err?.response?.data?.message || "Failed to update password";
          set({ error: message, loading: false });
          return { success: false, message };
        }
      },
    }),
    {
      name: "profile-store",
      version: 1,
      // partialize: (s) => ({ users: s.users }), // optional
    }
  )
);

// ---- Bulletproof reset helpers (use these from components)
export const resetProfileStore = () => {
  // Replace in-memory state
  useProfileStore.setState({ ...initialProfileState }, true);
};

export const clearProfilePersist = async () => {
  // Wipe persisted storage for this store (if using zustand v4 persist)
  useProfileStore.persist?.clearStorage?.();
  await useProfileStore.persist?.rehydrate?.();
};
