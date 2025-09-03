import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../services/api";

export const useUserStore = create(
  persist(
    (set, get) => ({
      users: [],
      userEdit: null,
      userAdd: null,
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
      _getAuth: () => {
        const token =
          get().token ||
          localStorage.getItem("token") ||
          JSON.parse(localStorage.getItem("token"));
        if (!token) throw new Error("Token is required");
        return { headers: { authorization: `Bearer ${token}` } };
      },

      // Fetch all users
      fetchUsers: async () => {
        const token = get().token;
        set({ loading: true, error: null });
        try {
          const res = await api.get("/users", {
            headers: {
              authorization: `Bearer ${token || localStorage.getItem("token")}`,
            },
          });
          set({ users: res.data?.data || [], loading: false });
        } catch (err) {
          set({
            error: err.response?.data?.message || "Failed to fetch users",
            loading: false,
          });
        }
      },

      // Get a single user by ID (from local state)
      getUserById: (id) => {
        return get().users.find((u) => u.id === id) || null;
      },

      // Add a new user
      addUser: async (newUser) => {
        const token = get().token;
        try {
          const res = await api.post("/users", newUser, {
            headers: {
              authorization: `Bearer ${token || localStorage.getItem("token")}`,
            },
          });
          set((state) => ({
            users: [...state.users, res.data?.data],
            userAdd: res.data?.data,
          }));
        } catch (err) {
          set({
            error: err.response?.data?.message || "Failed to add user",
          });
          console.error("Add user failed", err);
        }
      },

      // Update a user
      updateUser: async (id, updatedUser) => {
        // const token = get().token;
        try {
          const res = await api.put(`/users/${id}`, updatedUser, {
            headers: {
              authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          set((state) => ({
            users: state.users.map((u) => (u.id === id ? res.data?.data : u)),
            userEdit: res.data?.data,
          }));
        } catch (err) {
          console.error("Update user failed", err);
        }
      },

      // Delete a user
      deleteUser: async (id) => {
        const token = get().token;
        try {
          await api.delete(`/users/${id}`, get()._getAuth());
          set((state) => ({
            users: state.users.filter((u) => u.id !== id),
          }));
        } catch (err) {
          console.error("Delete user failed", err);
        }
      },

      // Store token
      setToken: (token) => {
        localStorage.setItem("token", token);
        set({ token });
      },

      // Remove token (logout)
      logout: () => {
        localStorage.removeItem("token");
        set({ token: null });
      },
    }),
    {
      name: "user-store",
      partialize: (state) => ({ token: state.token, users: state.users }),
    }
  )
);
