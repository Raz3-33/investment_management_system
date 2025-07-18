import { create } from "zustand";
import { api } from "../services/api"; // Your API service

export const useUserStore = create((set) => ({
  users: [],
  userEdit: null,
  userAdd: null,
  loading: false,
  error: null,

  // Fetch users from API
  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/users"); // Adjust according to your backend route
      set({ users: res.data?.data, loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch users",
        loading: false,
      });
    }
  },

  // Add a new user
  addUser: async (newUser) => {
    try {
      const res = await api.post("/users", newUser); // Adjust according to your backend route
      set({
        userAdd:  res.data?.data, // Add the new user to the state
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to add users",
        loading: false,
      });
      console.error("Add user failed", err);
    }
  },

  // Update an existing user
  updateUser: async (id, updatedUser) => {
    try {
      const res = await api.put(`/users/${id}`, updatedUser); // Adjust route
      set({
        userEdit: res.data?.data,
      });
    } catch (err) {
      console.error("Update user failed", err);
    }
  },

  // Delete a user
  deleteUser: async (id) => {
    try {
      await api.delete(`/users/${id}`); // Adjust route
      set({
        users: set.getState().users.filter((user) => user.id !== id), // Remove the deleted user
      });
    } catch (err) {
      console.error("Delete user failed", err);
    }
  },
}));
