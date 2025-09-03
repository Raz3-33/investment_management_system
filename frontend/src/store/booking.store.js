import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../services/api";

export const useBookingStore = create(
  persist(
    (set, get) => ({
      bookings: [],
      booking: null,
      addBooking: null,
      bookingUpdate: null,
      bookingDelete: null,
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
      logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        set({ token: null });
      },
      _getAuth: () => {
        const token =
          get().token ||
          localStorage.getItem("token") ||
          JSON.parse(localStorage.getItem("token"));
        if (!token) throw new Error("Token is required");
        return { headers: { authorization: `Bearer ${token}` } };
      },

      fetchBookings: async () => {
        set({ loading: true, error: null });
        try {
          const res = await api.get("/bookings", get()._getAuth());
          set({ bookings: res.data?.data || [], loading: false });
        } catch (err) {
          set({
            error: err.response?.data?.message || "Failed to fetch bookings",
            loading: false,
          });
        }
      },

      fetchBookingById: async (id) => {
        set({ loading: true, error: null });
        try {
          const res = await api.get(`/bookings/${id}`, get()._getAuth());
          set({ booking: res.data?.data || null, loading: false });
        } catch (err) {
          set({
            error: err.response?.data?.message || "Failed to fetch booking",
            loading: false,
          });
        }
      },

      addBookingRequest: async (newBooking) => {
        set({ loading: true, error: null });
        try {
          const res = await api.post("/bookings", newBooking, get()._getAuth());
          set({ addBooking: res.data?.data, loading: false });
        } catch (err) {
          set({
            error: err.response?.data?.message || "Failed to add booking",
            loading: false,
          });
        }
      },

      updateBooking: async (id, updatedBooking) => {
        set({ loading: true, error: null });
        try {
          const res = await api.put(
            `/bookings/${id}`,
            updatedBooking,
            get()._getAuth()
          );
          set({ bookingUpdate: res.data?.data, loading: false });
        } catch (err) {
          set({
            error: err.response?.data?.message || "Failed to update booking",
            loading: false,
          });
        }
      },

      deleteBooking: async (id) => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.delete(
            `/bookings/${id}`,
            get()._getAuth()
          );
          set({ bookingDelete: data, loading: false });
        } catch (err) {
          set({
            error: err.response?.data?.message || "Failed to delete booking",
            loading: false,
          });
        }
      },

      updatePaymentApproval: async (paymentId, approvalKey, status) => {
        set({ loading: true, error: null });
        try {
          const res = await api.put(
            `/bookings/payments/approval/${paymentId}`,
            { approvalKey, status },
            get()._getAuth()
          );
          set({ loading: false });
          return res.data?.data;
        } catch (err) {
          set({
            error:
              err.response?.data?.message ||
              "Failed to update payment approval",
            loading: false,
          });
          throw err;
        }
      },

      // inside create(...) in useBookingStore
      updateScheduledPaymentApproval: async (scheduledId, status) => {
        set({ loading: true, error: null });
        try {
          const res = await api.put(
            `/bookings/payments/scheduled/approval/${scheduledId}`,
            { status }, // "Approved" | "Pending"
            get()._getAuth()
          );
          set({ loading: false });
          return res.data?.data;
        } catch (err) {
          set({
            error:
              err.response?.data?.message ||
              "Failed to update scheduled payment approval",
            loading: false,
          });
          throw err;
        }
      },

      convertBookingToInvestment: async (personalDetailsId) => {
        set({ loading: true, error: null });
        try {
          const res = await api.post(
            `/bookings/convert-to-investment/${personalDetailsId}`,
            {},
            get()._getAuth()
          );
          set({ loading: false });
          return res.data?.data;
        } catch (err) {
          set({
            error:
              err.response?.data?.message || "Failed to convert to investment",
            loading: false,
          });
          throw err;
        }
      },

      updateDocumentApproval: async (
        personalDetailsId,
        docKey,
        status = "Approved"
      ) => {
        set({ loading: true, error: null });
        try {
          const res = await api.put(
            `/bookings/documents/approval/${personalDetailsId}`,
            { docKey, status },
            get()._getAuth()
          );
          set({ loading: false });
          return res.data?.data;
        } catch (err) {
          set({
            error: err.response?.data?.message || "Failed to approve document",
            loading: false,
          });
          throw err;
        }
      },
    }),
    {
      name: "booking-store",
      partialize: (s) => ({ bookings: s.bookings, token: s.token }),
    }
  )
);
