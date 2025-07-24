import { prisma } from "../config/db.js";

// Calculate the payout based on the investment details
const calculatePayoutAmount = (investment, payoutMode) => {
  let amountDue = 0;

  // Calculate amount due based on the payout mode (e.g., monthly, quarterly)
  if (payoutMode === "Monthly") {
    amountDue = (investment.amount * investment.roiPercent) / 100 / 12; // Monthly ROI
  } else if (payoutMode === "Quarterly") {
    amountDue = (investment.amount * investment.roiPercent) / 100 / 4; // Quarterly ROI
  } else {
    // You can add other payout modes like yearly, etc.
    amountDue = (investment.amount * investment.roiPercent) / 100; // Yearly ROI
  }

  return amountDue;
};

// Create a payout
export const createPayoutService = async ({
  investmentId,
  dueDate,
  amountDue,
  paymentMode,
  receiptRef,
  notes,
}) => {
  // Fetch the investment details
  const investment = await prisma.investment.findUnique({
    where: { id: investmentId },
    include: {
      investor: true,
    },
  });

  if (!investment) {
    throw new Error("Investment not found");
  }

  // Calculate the payout amount based on the ROI and payout mode
  const calculatedAmountDue = calculatePayoutAmount(investment, paymentMode);

  // Create the payout entry in the database
  const payout = await prisma.payout.create({
    data: {
      investmentId,
      dueDate,
      amountDue: calculatedAmountDue,
      paymentMode,
      receiptRef,
      notes,
    },
  });

  return payout;
};

// Get all payouts for a specific investment
export const getPayoutsService = async (investmentId) => {
  return await prisma.payout.findMany({
    where: { investmentId },
  });
};

// Update a payout
export const updatePayoutService = async (payoutId, data) => {
  const { amountPaid, paidDate, notes } = data;

  return await prisma.payout.update({
    where: { id: payoutId },
    data: {
      amountPaid,
      paidDate,
      notes,
    },
  });
};
