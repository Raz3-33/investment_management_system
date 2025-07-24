import {
  createPayoutService,
  getPayoutsService,
  updatePayoutService,
} from "../services/payout.service.js";

// Create a new payout
export const createPayout = async (req, res) => {
  const { investmentId, dueDate, amountDue, paymentMode, receiptRef, notes } =
    req.body;

  try {
    const payout = await createPayoutService({
      investmentId,
      dueDate,
      amountDue,
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
  const { investmentId } = req.params;

  try {
    const payouts = await getPayoutsService(investmentId);
    res.status(200).json({ success: true, data: payouts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a payout
export const updatePayout = async (req, res) => {
  const { payoutId } = req.params;
  const { amountPaid, paidDate, notes } = req.body;

  try {
    const updatedPayout = await updatePayoutService(payoutId, {
      amountPaid,
      paidDate,
      notes,
    });
    res.status(200).json({ success: true, data: updatedPayout });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
