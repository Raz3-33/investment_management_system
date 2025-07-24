import { prisma } from "../config/db.js";

// Calculate the payout based on the investment details
const calculatePayoutAmount = (investment, payoutMode) => {
  let amountDue = 0;

  console.log(investment, "investmentinvestmentinvestmentinvestment");

  // Calculate amount due based on the payout mode (e.g., monthly, quarterly)
  if (payoutMode === "Monthly") {
    amountDue = (investment.amount * investment.roiPercent) / 100 / 12; // Monthly ROI
  } else if (payoutMode === "Quarterly") {
    amountDue = (investment.amount * investment.roiPercent) / 100 / 4; // Quarterly ROI
  } else {
    // You can add other payout modes like yearly, etc.
    amountDue = (investment.amount * investment.roiPercent) / 100; // Yearly ROI
    console.log(amountDue, "amountDueamountDueamountDueamountDue");
  }

  return amountDue;
};

export const createPayoutService = async ({
  investmentId,
  dueDate,
  amountDue,
  amountPaid, // Add amountPaid field
  paymentMode,
  receiptRef,
  notes,
}) => {
  console.log(amountPaid, "amountPaidamountPaidamountPaidamountPaid");

  // Convert the amountPaid string to a number
  const paidAmount = Number(amountPaid);

  console.log(paidAmount, "paidAmountpaidAmountpaidAmountpaidAmount");

  // Ensure the paidAmount is a valid number
  if (isNaN(paidAmount) || paidAmount < 0) {
    throw new Error("Invalid amountPaid. It must be a non-negative number.");
  }

  // Convert the dueDate string to a Date object (if it's a valid date string)
  const dueDateObj = new Date(dueDate); // Ensure this is a valid date object

  // Check if the dueDate is a valid Date
  if (isNaN(dueDateObj.getTime())) {
    throw new Error("Invalid dueDate format. Please provide a valid date.");
  }

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
      dueDate: dueDateObj,
      amountDue: calculatedAmountDue, // Calculated amount due
      amountPaid: paidAmount, // Store the valid paid amount
      paymentMode,
      receiptRef,
      notes,
    },
  });

  return payout;
};

// Get all payouts for a specific investment
export const getPayoutsService = async () => {
  return await prisma.payout.findMany({
    where: {},
  });
};

// Update a payout
export const updatePayoutService = async (payoutId, data) => {
  const { amountPaid, paidDate, notes, paymentMode, receiptRef } = data;

  let paidAmount = Number(amountPaid);

  // Validate that amountPaid is a valid number
  if (isNaN(paidAmount) || paidAmount < 0) {
    throw new Error("Invalid amountPaid. It must be a non-negative number.");
  }

  // Validate paidDate
  const paidDateObj = new Date(paidDate);
  if (isNaN(paidDateObj.getTime())) {
    throw new Error("Invalid paidDate. Please provide a valid date.");
  }

  try {
    // Update payout in the database
    const updatedPayout = await prisma.payout.update({
      where: { id: payoutId },
      data: {
        paidAmount,
        paidDate: paidDateObj,
        notes,
        paymentMode,
        receiptRef,
      },
    });

    return updatedPayout; // Return the updated payout record
  } catch (error) {
    throw new Error("Error updating payout: " + error.message);
  }
};

// Delete a payout
export const deletePayout = async (payoutId) => {
  try {
    // Check if the payout exists
    const payout = await prisma.payout.findUnique({
      where: { id: payoutId },
    });

    if (!payout) {
      throw new Error("Payout not found");
    }

    // Delete the payout
    await prisma.payout.delete({
      where: { id: payoutId },
    });

    return "Payout deleted successfully";
  } catch (error) {
    throw new Error("Error updating payout: " + error.message);
  }
};
