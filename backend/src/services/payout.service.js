import { prisma } from "../config/db.js";
import { calculateInvestorPayout } from "../helper/payout.helper.js";

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

// Create payout entry
export const createPayoutService = async ({
  investmentId,
  dueDate,
  amountDue,
  amountPaid,
  paymentMode,
  receiptRef,
  notes,
  paidDate, // Accept paidDate as parameter
}) => {
  // Convert the amountPaid string to a number
  const paidAmount = Number(amountPaid);

  // Ensure the paidAmount is a valid number
  if (isNaN(paidAmount) || paidAmount < 0) {
    throw new Error("Invalid amountPaid. It must be a non-negative number.");
  }

  // Convert the dueDate string to a Date object (if it's a valid date string)
  const dueDateObj = new Date(dueDate);

  // Check if the dueDate is a valid Date
  if (isNaN(dueDateObj.getTime())) {
    throw new Error("Invalid dueDate format. Please provide a valid date.");
  }

  // Convert the paidDate string to a Date object (if it's a valid date string)
  const paidDateObj = paidDate ? new Date(paidDate) : null;

  // Check if the paidDate is valid
  if (paidDate && isNaN(paidDateObj.getTime())) {
    throw new Error("Invalid paidDate format. Please provide a valid date.");
  }

  // Fetch the investment details from the database
  const investment = await prisma.investment.findUnique({
    where: { id: investmentId },
    include: {
      opportunity: true, // Include opportunity to get turnover and MG details
    },
  });

  if (!investment) {
    throw new Error("Investment not found");
  }

  // Calculate the payout amount based on the total sales for the month
  const payoutAmount = await calculateInvestorPayout(
    investment.id,
    dueDateObj.getMonth() + 1,
    dueDateObj.getFullYear()
  );

  // Create the payout entry in the database
  const payout = await prisma.payout.create({
    data: {
      investmentId,
      dueDate: dueDateObj,
      amountDue: payoutAmount,
      amountPaid: paidAmount,
      paymentMode,
      receiptRef,
      notes,
      paidDate: paidDateObj,
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

  let parsedAmountPaid = Number(amountPaid); // Convert to number

  // Validate that amountPaid is a valid number
  if (isNaN(parsedAmountPaid) || parsedAmountPaid < 0) {
    throw new Error("Invalid amountPaid. It must be a non-negative number.");
  }

  // Validate paidDate
  const parsedPaidDate = new Date(paidDate);
  if (isNaN(parsedPaidDate.getTime())) {
    throw new Error("Invalid paidDate. Please provide a valid date.");
  }

  try {
    // Update payout in the database
    const updatedPayout = await prisma.payout.update({
      where: { id: payoutId },
      data: {
        amountPaid: parsedAmountPaid, // Ensure we use the correct field name
        paidDate: parsedPaidDate, // Correctly use paidDate as a Date object
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
