import { create } from "zustand";
import { api } from "../services/api"; //  Reuse your api service

export const useBookingStore = create((set) => ({
  bookings: [],
  booking: null,
  addBooking: null,
  bookingUpdate: null,
  bookingDelete: null,
  loading: false,
  error: null,

  //  Fetch all bookings
  fetchBookings: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/bookings");
      set({ bookings: res.data?.data || [], loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch bookings",
        loading: false,
      });
    }
  },

  //  Fetch booking by ID
  fetchBookingById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/bookings/${id}`);
      set({ booking: res.data?.data || null, loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch booking",
        loading: false,
      });
    }
  },

  //  Add new booking
  addBookingRequest: async (newBooking) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/bookings", newBooking);
      set({
        addBooking: res.data?.data,
        loading: false,
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to add booking",
        loading: false,
      });
    }
  },

  //  Update booking
  updateBooking: async (id, updatedBooking) => {
    set({ loading: true, error: null });
    try {
      const res = await api.put(`/bookings/${id}`, updatedBooking);
      set({
        bookingUpdate: res.data?.data,
        loading: false,
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to update booking",
        loading: false,
      });
    }
  },

  //  Delete booking
  deleteBooking: async (id) => {
    set({ loading: true, error: null });
    try {
      let { data } = await api.delete(`/bookings/${id}`);
      set({
        bookingDelete: data,
        loading: false,
      });
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
      // Get token from store or localStorage
      const token = localStorage.getItem("token");
      alert(token);
      console.log(token, "tokentokentokentokentokentoken");

      if (!token) {
        console.error("Token is missing");
        set({ loading: false, error: "Token is required" });
        throw new Error("Token is required");
      }
      const payload = { approvalKey, status };

      // Pass token in Authorization header
      const res = await api.put(
        `/bookings/payments/approval/${paymentId}`,
        payload,
        {
          headers: {
            authorization: `Bearer ${token}`, // Attach token for authentication
          },
        }
      );
      set({ loading: false });
      return res.data?.data;
    } catch (err) {
      set({
        error:
          err.response?.data?.message || "Failed to update payment approval",
        loading: false,
      });
      throw err;
    }
  },

  // store/booking.store.js
  convertBookingToInvestment: async (personalDetailsId) => {
    // personalDetailsId = BookingFormPersonalDetails.id
    // assumes your auth token is in localStorage
    const token = localStorage.getItem("token");
    if (!token) {
      set({ error: "Token is required" });
      throw new Error("Token is required");
    }

    set({ loading: true, error: null });
    try {
      const res = await api.post(
        `/bookings/convert-to-investment/${personalDetailsId}`,
        {},
        {
          headers: { authorization: `Bearer ${token}` },
        }
      );
      set({ loading: false });
      return res.data?.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to convert to investment",
        loading: false,
      });
      throw err;
    }
  },


  // store/booking.store.js
updateDocumentApproval: async (personalDetailsId, docKey, status = "Approved") => {
  set({ loading: true, error: null });
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      set({ loading: false, error: "Token is required" });
      throw new Error("Token is required");
    }
    const res = await api.put(
      `/bookings/documents/approval/${personalDetailsId}`,
      { docKey, status },
      { headers: { authorization: `Bearer ${token}` } }
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

}));
