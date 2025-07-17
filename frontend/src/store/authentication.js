import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../services/api";

export const useAuthStore = create(
    persist(
        (set, get) => ({
            logins: [],
            loginDetails: null,
            loadingLoginDetail: false,
            errorLoginDetail: null,
            loading: false,
            error: null,



            login: async (data) => {
                try {


                    const res = await api.post("/auth/login", data); // Optional API POST
                    console.log(res.data.data.token, "dononononon")
                    localStorage.setItem("token", res.data.data.token); // Save token
                    localStorage.setItem("user", JSON.stringify(res.data.data.user)); // Save user info if needed

                    set((state) => ({
                        loginDetails: res.data?.data,
                    }));
                } catch (err) {
                    console.error("Login failed", err);
                    // Optional: set({ error: "Failed to add role" });
                }
            },


        }),
        {
            name: "auth-store",
            partialize: (state) => ({ logins: state.logins }), // persist only roles
        }
    )
);
