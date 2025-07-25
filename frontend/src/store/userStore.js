import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../services/api"; // Your API service

export const useUserStore = create(
  persist(
    (set, get) => ({
      users: [],
      userEdit: null,
      userAdd: null,
      loading: false,
      error: null,
      token: localStorage.getItem("token") || null, // Load the token from localStorage if available

      // Fetch users from API
      fetchUsers: async () => {
        const token = get().token;
        set({ loading: true, error: null });
        try {
          const res = await api.get("/users", {
            headers: {
              Authorization: `Bearer ${token}`, // Attach token to the request
            },
          });
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
        const token = get().token;
        try {
          const res = await api.post("/users", newUser, {
            headers: {
              Authorization: `Bearer ${token}`, // Attach token to the request
            },
          });
          set({
            userAdd: res.data?.data, // Add the new user to the state
          });
        } catch (err) {
          set({
            error: err.response?.data?.message || "Failed to add user",
            loading: false,
          });
          console.error("Add user failed", err);
        }
      },

      // Update an existing user
      updateUser: async (id, updatedUser) => {
        const token = get().token;
        try {
          const res = await api.put(`/users/${id}`, updatedUser, {
            headers: {
              Authorization: `Bearer ${token}`, // Attach token to the request
            },
          });
          set({
            userEdit: res.data?.data,
          });
        } catch (err) {
          console.error("Update user failed", err);
        }
      },

      // Delete a user
      deleteUser: async (id) => {
        const token = get().token;
        try {
          await api.delete(`/users/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`, // Attach token to the request
            },
          });
          set({
            users: get().users.filter((user) => user.id !== id), // Remove the deleted user
          });
        } catch (err) {
          console.error("Delete user failed", err);
        }
      },

      // Function to store the token in the state and localStorage
      setToken: (token) => {
        localStorage.setItem("token", token); // Save token in localStorage
        set({ token }); // Set token in Zustand state
      },

      // Function to remove token from the state and localStorage (logout)
      logout: () => {
        localStorage.removeItem("token");
        set({ token: null });
      },
    }),
    {
      name: "user-store", // Persisted store name
      partialize: (state) => ({ token: state.token, users: state.users }), // Persist only token and users
    }
  )
);
