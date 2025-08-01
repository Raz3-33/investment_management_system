import { prisma } from "../config/db.js";

// Create a new sale
export const createSalesService = async ({ opportunityId, amount, date }) => {
  const sales = await prisma.sales.create({
    data: {
      opportunityId,
      amount,
      date: new Date(date), // Ensure the date is properly converted to a Date object
    },
  });

  return sales;
};

// Get sales by opportunity
export const getSalesService = async (opportunityId) => {
  const sales = await prisma.sales.findMany({
    where: { opportunityId },
  });

  return sales;
};

// Get all sales service method
export const getAllSalesService = async () => {
  try {
    // Fetch sales and include related opportunity details (InvestmentOpportunity)
    const sales = await prisma.sales.findMany({
      include: {
        opportunity: {
          select: {
            id: true,
            name: true,
            brandName: true,
            description: true,
          },
        },
      },
    });

    if (!sales) {
      throw new Error("No sales records found.");
    }

    return sales;
  } catch (error) {
    throw new Error("Error fetching sales: " + error.message);
  }
};

// Update a sale
export const updateSalesService = async (salesId, { amount, date }) => {
  const updatedSales = await prisma.sales.update({
    where: { id: salesId },
    data: {
      amount,
      date: new Date(date),
    },
  });

  return updatedSales;
};

// Delete a sale
export const deleteSalesService = async (salesId) => {
  const deletedSales = await prisma.sales.delete({
    where: { id: salesId },
  });

  return deletedSales;
};
