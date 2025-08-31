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

export const convertToInvestment = async (req, res) => {
  try {
    const { personalDetailsId } = req.params;
    const userId = req.user?.id || null; // if you attach auth user
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
