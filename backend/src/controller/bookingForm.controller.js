import * as bookingFormService from "../services/bookingForm.service.js";

// Get all bookings
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await bookingFormService.getAllBookings();
    res.status(200).json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get a booking by ID
export const getBookingById = async (req, res) => {
  try {
    const booking = await bookingFormService.getBookingById(req.params.id);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }
    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update Payment Approval (Token Approval)
export const updatePaymentApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvalKey, status } = req.body;
    const user = req.user;
    const bookingPayment = await bookingFormService.updatePaymentApproval(
      id,
      approvalKey,
      status,
      user
    );

    if (!bookingPayment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment record not found" });
    }
    res.status(200).json({ success: true, data: bookingPayment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Convert Booking to Investment
export const convertToInvestment = async (req, res) => {
  try {
    const { personalDetailsId } = req.params;
    const userId = req.user?.id || null; // If user is authenticated
    const result = await bookingFormService.convertToInvestment({
      personalDetailsId,
      createdById: userId,
    });
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    const code = /not found|missing|required|invalid/i.test(error.message)
      ? 400
      : /duplicate|exists|already/i.test(error.message)
      ? 409
      : 500;
    return res.status(code).json({
      success: false,
      message: error.message || "Failed to convert to investment",
    });
  }
};

// Mark Territory as Booked
export const markTerritoryBooked = async (req, res) => {
  try {
    const { personalDetailsId } = req.params;
    const result = await bookingFormService.markTerritoryBooked({
      personalDetailsId,
      user: req.user,
    });

    if (!result.success) {
      return res
        .status(result.statusCode || 400)
        .json({ success: false, message: result.message });
    }

    return res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Unmark Territory as Booked (Revoke Booking)
export const unmarkTerritoryBooked = async (req, res) => {
  try {
    const { personalDetailsId } = req.params; // Get the personal details ID from the route
    const result = await bookingFormService.unmarkTerritoryBooked({
      personalDetailsId,
      user: req.user, // Pass the current user from the request
    });

    if (!result.success) {
      return res
        .status(result.statusCode || 400)
        .json({ success: false, message: result.message });
    }

    return res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    console.error("Error in unmarkTerritoryBooked:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Approve Document
// Controller update for document approval
export const updateDocumentApproval = async (req, res) => {
  try {
    const { personalDetailsId } = req.params;
    const { docKey, status } = req.body; // status: "Approved" | "Pending"
    const result = await bookingFormService.updateDocumentApproval(
      personalDetailsId,
      docKey,
      status,
      req.user
    );

    if (!result.success) {
      return res.status(result.statusCode || 400).json({
        success: false,
        message: result.message || "Failed to update document approval",
      });
    }

    return res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Approve Scheduled Payment
export const updateScheduledPaymentApproval = async (req, res) => {
  try {
    const { id } = req.params; // schedule row id
    const { status } = req.body; // "Approved" | "Pending"
    const result = await bookingFormService.updateScheduledPaymentApproval(
      id,
      status,
      req.user
    );

    if (!result.success) {
      return res
        .status(result.statusCode || 400)
        .json({ success: false, message: result.message });
    }

    return res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
