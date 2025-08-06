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

  console.log(totalSales,"totalSalestotalSalestotalSalestotalSalestotalSales");
  

  // Determine how many days are left in the month (for partial month calculation)
  const today = new Date();
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysLeftInMonth = daysInMonth - today.getDate();

  let payoutAmount = 0;
  let payoutPercentage = 0;

  // Check if the total sales reached the turnover amount
  if (totalSales >= (opportunity.turnOverAmount || 0)) {
    payoutPercentage = opportunity.turnOverPercentage || 0;
    payoutAmount = (payoutPercentage / 100) * totalSales; // Payout based on turnover percentage
  } else {
    payoutPercentage = opportunity.roiPercent || 0;
    payoutAmount = (payoutPercentage / 100) * investment.amount; // Payout based on MG percentage
  }

  // If the payout mode is monthly, calculate based on the days left in the month
  if (investment.payoutMode === "Monthly") {
    console.log(daysInMonth,"dailyPayoutdailyPayoutdailyPayoutdailyPayoutdailyPayout");
    console.log(payoutAmount,"payoutAmountpayoutAmountpayoutAmountpayoutAmountpayoutAmount");


    const dailyPayout = payoutAmount / daysInMonth; // Calculate daily payout
    console.log(dailyPayout,"dailyPayoutdailyPayoutdailyPayoutdailyPayoutdailyPayout");
    
    payoutAmount = dailyPayout * daysLeftInMonth; // Multiply by the number of days left
  } 
  // If the payout mode is quarterly
  else if (investment.payoutMode === "Quarterly") {
    const daysInQuarter = 90; // Approximation of quarter days
    const dailyPayout = payoutAmount / daysInQuarter;
    const daysLeftInQuarter = 90 - ((today.getDate() + (month - 1) * 30) % 90);
    payoutAmount = dailyPayout * daysLeftInQuarter;
  }
  // If the payout mode is yearly
  else if (investment.payoutMode === "Yearly") {
    const daysInYear = 365; // Approximation of year days
    const dailyPayout = payoutAmount / daysInYear;
    const daysLeftInYear = 365 - today.getDay();
    payoutAmount = dailyPayout * daysLeftInYear;
  }
console.log(payoutAmount,"payoutAmountpayoutAmountpayoutAmountpayoutAmountpayoutAmount");

  return payoutAmount;
};