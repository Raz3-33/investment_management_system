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
    select: {
      id: true,
      name: true,
      brandName: true,
      description: true,
      minAmount: true,
      maxAmount: true,
      roiPercent: true,
      turnOverPercentage: true,
      turnOverAmount: true,
      renewalFee: true,
      lockInMonths: true,
      exitOptions: true,
      payoutMode: true,
      isActive: true,
      documents: true,
      isMasterFranchise: true, // Scalar field
      isSignature: true, // Scalar field
      signatureStoreLocation: true, // Scalar field
      investmentType: {
        select: {
          id: true,
          name: true
        }
      },
      businessCategory: {
        select: {
          id: true,
          name: true
        }
      },
      opportunityBranches: {
        select: {
          branch: {
            select: {
              id: true,
              name: true
            }
          }
        }
      },
      territoryMasters: {
        select: {
          territory: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
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
    lockInMonths,
    brandName,
    exitOptions,
    payoutMode,
    renewalFee,
    selectedBranchIds,
    isStore, // New field
    isSignature, // New field
    signatureStoreLocation, // New field
    selectedTerritoryIds, // New field for territories
  } = data;
console.log(data);
console.log(selectedTerritoryIds,"selectedTerritoryIdsselectedTerritoryIdsselectedTerritoryIdsselectedTerritoryIds");


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
        isStore, 
        isSignature, 
        signatureStoreLocation,
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

    // Handle the relationship between opportunity and territories (for Master Franchise)
    if (
      isStore &&
      selectedTerritoryIds &&
      selectedTerritoryIds.length > 0
    ) {
      const territoryMasters = selectedTerritoryIds.map((territoryId) => ({
        opportunityId: newOpportunity.id,
        territoryId,
      }));

      await prisma.territoryMaster.createMany({
        data: territoryMasters,
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
    isMasterFranchise, // New field for Master Franchise
    isSignature, // New field for Signature Store
    signatureStoreLocation, // New field for Signature Store location
    selectedTerritoryIds, // New field for Territory IDs
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
      isMasterFranchise, // Update Master Franchise flag
      isSignature, // Update Signature Store flag
      signatureStoreLocation, // Update Signature Store location

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

    // Handle the relationship between opportunity and territories (for Master Franchise)
    if (
      isMasterFranchise &&
      selectedTerritoryIds &&
      selectedTerritoryIds.length > 0
    ) {
      // First, delete any existing territory relations
      await prisma.territoryMaster.deleteMany({
        where: { opportunityId: updatedOpportunity.id },
      });

      // Create new relationships for territories if it's a Master Franchise
      const territoryMasters = selectedTerritoryIds.map((territoryId) => ({
        opportunityId: updatedOpportunity.id,
        territoryId,
      }));

      await prisma.territoryMaster.createMany({
        data: territoryMasters,
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
