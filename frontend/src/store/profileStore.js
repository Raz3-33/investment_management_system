import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../services/api"; // Your API service

export const useProfileStore = create(
  persist((set, get) => ({
    users: null,
    loading: false,
    error: null,

    // Fetch users from API
    fetchProfiles: async () => {
      set({ loading: true, error: null });
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const id = user?.id;
        const res = await api.get("/profile/findUsers", { params: { id } });
        set({ users: res.data?.data, loading: false });
      } catch (err) {
        set({
          error: err.response?.data?.message || "Failed to fetch users",
          loading: false,
        });
      }
    },
    // Update password action
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
          message: res.data?.message || "Password updated successfully",
        };
      } catch (err) {
        set({
          error: err.response?.data?.message || "Failed to update password",
          loading: false,
        });
        return {
          success: false,
          message: err.response?.data?.message || "Failed to update password",
        };
      }
    },
  }))
);
