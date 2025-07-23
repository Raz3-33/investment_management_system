import { prisma } from "../config/db.js"; // Prisma setup

// Fetch all investment opportunities
export const getAllInvestmentOpportunities = async () => {
  return prisma.investmentOpportunity.findMany({
    include: {
      investmentType: true,
      businessCategory: true,
    },
  });
};

// Fetch a single investment opportunity by ID
export const getInvestmentOpportunityById = async (id) => {
  return prisma.investmentOpportunity.findUnique({
    where: { id },
    include: {
      investmentType: true,
      businessCategory: true,
    },
  });
};

export const createInvestmentOpportunity = async (data) => {
  const {
    name,
    description,
    investmentTypeId,
    businessCategoryId,
    minAmount,
    maxAmount,
    roiPercent,
    lockInMonths,
    brandName,
    exitOptions,
    payoutMode,
  } = data;

  // Validate that the investment type and business category exist
  const investmentTypeExists = await prisma.investmentType.findUnique({
    where: { id: investmentTypeId },
  });
  const businessCategoryExists = await prisma.businessCategory.findUnique({
    where: { id: businessCategoryId },
  });

  if (!investmentTypeExists || !businessCategoryExists) {
    throw new Error("Invalid investment type or business category.");
  }

  try {
    const newOpportunity = await prisma.investmentOpportunity.create({
      data: {
        name,
        description,
        investmentTypeId,
        businessCategoryId,
        minAmount: parseFloat(minAmount),
        maxAmount: maxAmount ? parseFloat(maxAmount) : null,
        roiPercent: parseFloat(roiPercent),
        lockInMonths: parseInt(lockInMonths),
        brandName,
        exitOptions,
        payoutMode,
        isActive: true,
      },
    });

    return newOpportunity;
  } catch (error) {
    throw new Error("Error creating investment opportunity: " + error.message);
  }
};

// Update an existing investment opportunity
export const updateInvestmentOpportunity = async (id, data) => {
  try {
    // Convert numeric fields to appropriate types
    const updatedData = {
      ...data,
      minAmount: parseFloat(data.minAmount),
      maxAmount: data.maxAmount ? parseFloat(data.maxAmount) : null,
      roiPercent: parseFloat(data.roiPercent),
      lockInMonths: parseInt(data.lockInMonths),
    };

    const updatedOpportunity = await prisma.investmentOpportunity.update({
      where: { id },
      data: updatedData,
    });

    return updatedOpportunity;
  } catch (error) {
    throw new Error("Error updating investment opportunity: " + error.message);
  }
};

// Delete an investment opportunity
export const deleteInvestmentOpportunity = async (id) => {
  // Check if the investment opportunity is assigned to any investment
  const assignedInvestments = await prisma.investment.findMany({
    where: {
      opportunityId: id,
    },
  });

  if (assignedInvestments.length > 0) {
    throw new Error(
      "Cannot delete this investment opportunity as it is already assigned to investments."
    );
  }

  try {
    await prisma.investmentOpportunity.delete({
      where: { id },
    });
  } catch (error) {
    throw new Error("Error deleting investment opportunity: " + error.message);
  }
};
