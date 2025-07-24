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

  try {
    const updatedPayout = await updatePayoutService(payoutId, {
      amountPaid,
      paidDate,
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
