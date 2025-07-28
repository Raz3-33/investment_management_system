import {
  createPayoutService,
  deletePayout,
  getPayoutsService,
  updatePayoutService,
} from "../services/payout.service.js";

// Create a new payout
export const createPayout = async (req, res) => {
  const {
    investmentId,
    dueDate,
    amountDue,
    amountPaid,
    paymentMode,
    receiptRef,
    notes,
  } = req.body;

  try {
    const payout = await createPayoutService({
      investmentId,
      dueDate,
      amountDue,
      amountPaid, // Add amountPaid field
      paymentMode,
      receiptRef,
      notes,
    });
    res.status(201).json({ success: true, data: payout });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all payouts for a specific investment
export const getPayouts = async (req, res) => {
  //   const { investmentId } = req.params;

  try {
    const payouts = await getPayoutsService();
    console.log(payouts, "payoutspayoutspayoutspayouts");

    res.status(200).json({ success: true, data: payouts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a payout
export const updatePayout = async (req, res) => {
  const { payoutId } = req.params;
  const { amountPaid, paidDate, notes, paymentMode, receiptRef } = req.body;

  // Ensure amountPaid is a number and parse paidDate to a Date object
  const parsedAmountPaid = Number(amountPaid); // Convert amountPaid to a number
  const parsedPaidDate = paidDate ? new Date(paidDate) : null; // Parse paidDate to Date, or null if not provided

  // Validate parsedAmountPaid to ensure it's a valid number
  if (isNaN(parsedAmountPaid)) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Invalid amountPaid. It must be a valid number.",
      });
  }

  // Validate parsedPaidDate to ensure it's a valid date
  if (parsedPaidDate && isNaN(parsedPaidDate.getTime())) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Invalid paidDate. Please provide a valid date.",
      });
  }

  try {
    const updatedPayout = await updatePayoutService(payoutId, {
      amountPaid: parsedAmountPaid,
      paidDate: parsedPaidDate,
      notes,
      paymentMode,
      receiptRef,
    });

    res.status(200).json({ success: true, data: updatedPayout });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a payout
export const deletePayoutController = async (req, res) => {
  const { payoutId } = req.params; // Get the payout ID from the URL params

  try {
    // Check if the payout exists
    let data = deletePayout(payoutId);

    res.status(200).json({ success: true, data: data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
