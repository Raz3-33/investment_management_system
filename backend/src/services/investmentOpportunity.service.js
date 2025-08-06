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
    // include: {
    //   investmentType: true,
    //   businessCategory: true,
    // },
    include: {
      investmentType: true,
      businessCategory: true,
      opportunityBranches: {
        include: {
          branch: true, // Include the branch associated with the opportunity
        },
      },
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
    turnOverPercentage,
    // turnOverAmount,
    lockInMonths,
    brandName,
    exitOptions,
    payoutMode,
    renewalFee,
    selectedBranchIds,
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
    let calculatedRoiAmount = null;
    if (roiPercent && minAmount) {
      calculatedRoiAmount =
        (parseFloat(roiPercent) / 100) * parseFloat(minAmount);
    }

    // Create the new investment opportunity
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
        turnOverPercentage: parseInt(turnOverPercentage),
        turnOverAmount: calculatedRoiAmount,
        brandName,
        exitOptions,
        payoutMode,
        isActive: true,
        renewalFee: parseFloat(renewalFee),
      },
    });

    // After creating the opportunity, create the opportunity-branch relationship
    if (selectedBranchIds && selectedBranchIds.length > 0) {
      const opportunityBranches = selectedBranchIds.map((branchId) => ({
        opportunityId: newOpportunity.id, // Use the new opportunity ID
        branchId,
      }));

      await prisma.opportunityBranch.createMany({
        data: opportunityBranches,
      });
    }

    return newOpportunity;
  } catch (error) {
    throw new Error("Error creating investment opportunity: " + error.message);
  }
};

export const updateInvestmentOpportunity = async (id, data) => {
  const {
    name,
    description,
    investmentTypeId,
    businessCategoryId,
    minAmount,
    maxAmount,
    roiPercent,
    turnOverPercentage,
    lockInMonths,
    brandName,
    exitOptions,
    payoutMode,
    renewalFee,
    selectedBranchIds,
  } = data;
  
  try {
    let calculatedRoiAmount = null;
    if (roiPercent && minAmount) {
      calculatedRoiAmount =
        (parseFloat(roiPercent) / 100) * parseFloat(minAmount);
    }

    // Convert numeric fields to appropriate types
    const updatedData = {
      name,
      description,
      brandName,
      minAmount: parseFloat(minAmount),
      maxAmount: maxAmount ? parseFloat(maxAmount) : null,
      roiPercent: parseFloat(roiPercent),
      lockInMonths: parseInt(lockInMonths),
      turnOverPercentage: parseInt(turnOverPercentage),
      turnOverAmount: calculatedRoiAmount,
      exitOptions,
      payoutMode,
      renewalFee: parseFloat(renewalFee),
      isActive: true, // Assuming you want to keep it active by default

      // Correctly reference the nested relations for investmentType and businessCategory
      investmentType: {
        connect: { id: investmentTypeId }, // Correct way to update relations
      },
      businessCategory: {
        connect: { id: businessCategoryId }, // Correct way to update relations
      },
    };

    // Update the investment opportunity
    const updatedOpportunity = await prisma.investmentOpportunity.update({
      where: { id },
      data: updatedData,
    });

    // If branch IDs are provided, update the associated branches
    if (selectedBranchIds && selectedBranchIds.length > 0) {
      
      // First, delete any existing relationships between the opportunity and branches
      await prisma.opportunityBranch.deleteMany({
        where: { opportunityId: id },
      });
      
      // Create the new relationship between opportunity and branches
      const opportunityBranches = selectedBranchIds.map((branchId) => ({
        opportunityId: updatedOpportunity.id, // Use the updated opportunity ID
        branchId,
      }));
      await prisma.opportunityBranch.createMany({
        data: opportunityBranches,
      });
    }

    return updatedOpportunity;
  } catch (error) {
    console.log(error);
    
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

// Function to get an investment opportunity with its related branches
export const getInvestmentOpportunityWithBranchesService = async (
  opportunityId
) => {
  try {
    const opportunity = await prisma.investmentOpportunity.findUnique({
      where: { id: opportunityId },
      include: {
        opportunityBranches: {
          include: {
            branch: true, // Include the branch associated with the opportunity
          },
        },
      },
    });

    if (!opportunity) {
      throw new Error("Opportunity not found");
    }

    return opportunity;
  } catch (error) {
    throw new Error(
      "Error fetching opportunity with branches: " + error.message
    );
  }
};
