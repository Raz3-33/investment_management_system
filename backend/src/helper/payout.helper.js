import { prisma } from "../config/db.js";

// Helper function to calculate total sales for an opportunity in a given month
export const calculateTotalSales = async (opportunityId, month, year) => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const sales = await prisma.sales.findMany({
    where: {
      opportunityId,
      date: {
        gte: new Date(year, month - 1, 1),
        lte: new Date(year, month - 1, daysInMonth),
      },
    },
  });
  return sales.reduce((sum, sale) => sum + sale.amount, 0); // Sum the sales amounts
};

// Function to calculate the payout for an investor
export const calculateInvestorPayout = async (investmentId, month, year) => {
  const investment = await prisma.investment.findUnique({
    where: { id: investmentId },
    include: {
      opportunity: true,  // Include opportunity to get turnover and MG details
    },
  });

  if (!investment) throw new Error("Investment not found");

  const opportunity = investment.opportunity;

  // Calculate total sales for the opportunity in the given month
  const totalSales = await calculateTotalSales(opportunity.id, month, year);

  // Check if the total sales reached the turnover amount
  let payoutAmount = 0;
  let payoutPercentage = 0;

  // If total sales are greater than or equal to the turnover amount, calculate turnover percentage payout
  if (totalSales >= (opportunity.turnOverAmount || 0)) {
    payoutPercentage = opportunity.turnOverPercentage || 0;
    payoutAmount = (payoutPercentage / 100) * totalSales; // Payout based on turnover percentage
  } else {
    // Otherwise, use MG percentage
    payoutPercentage = opportunity.roiPercent || 0;
    payoutAmount = (payoutPercentage / 100) * totalSales; // Payout based on MG percentage
  }

  return payoutAmount;
};