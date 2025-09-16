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

      // flags
      isMasterFranchise: true,
      isSignature: true,
      isStockist: true,
      signatureStoreLocation: true,

      // lookups
      investmentType: { select: { id: true, name: true } },
      businessCategory: { select: { id: true, name: true } },

      // existing Master data
      territoryMasters: {
        select: { territory: { select: { id: true, name: true } } },
      },

      // NEW: Stockist territories via M:N
      territories: { select: { id: true, name: true } },

      opportunityBranches: {
        select: { branch: { select: { id: true, name: true } } },
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
    lockInMonths,
    brandId,
    exitOptions,
    payoutMode,
    renewalFee,
    isStore,        // Master Franchise
    isSignature,    // Signature Store
    isStockist,     // Stockist (no territories)
  } = data;

  // Validate referentials (unchanged)
  const [investmentTypeExists, businessCategoryExists, brandExists] =
    await Promise.all([
      prisma.investmentType.findUnique({ where: { id: investmentTypeId } }),
      prisma.businessCategory.findUnique({ where: { id: businessCategoryId } }),
      prisma.brand.findUnique({ where: { id: brandId } }),
    ]);
  if (!investmentTypeExists || !businessCategoryExists || !brandExists) {
    throw new Error("Invalid investment type, business category, or brand.");
  }

  try {
    const min = parseFloat(minAmount);
    const roi = parseFloat(roiPercent);
    const turnoverPct =
      turnOverPercentage !== undefined && turnOverPercentage !== ""
        ? parseFloat(turnOverPercentage)
        : null;

    const calculatedRoiAmount =
      !Number.isNaN(roi) && !Number.isNaN(min) ? (roi / 100) * min : null;

    const newOpportunity = await prisma.investmentOpportunity.create({
      data: {
        name,
        description,
        investmentTypeId,
        businessCategoryId,
        minAmount: min,
        maxAmount: maxAmount ? parseFloat(maxAmount) : null,
        roiPercent: roi,
        lockInMonths: parseInt(lockInMonths, 10),
        turnOverPercentage: turnoverPct,
        turnOverAmount: calculatedRoiAmount,

        brandId,
        brandName: brandExists.name,

        exitOptions,
        payoutMode,
        isActive: true,
        renewalFee: parseFloat(renewalFee),

        // flags
        isMasterFranchise: !!isStore,
        isSignature: !!isSignature,
        isStockist: !!isStockist,

      },
    });

    return newOpportunity;
  } catch (error) {
    throw new Error("Error creating investment opportunity: " + error.message);
  }
};

// services/investmentOpportunity.service.js
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

    // Existing
    isMasterFranchise,
    isSignature,
    signatureStoreLocation,
    selectedTerritoryIds, // for Master Franchise

    // NEW for Stockist
    isStockist,
    selectedStockistTerritoryIds = [],
  } = data;

  try {
    let calculatedRoiAmount = null;
    if (roiPercent && minAmount) {
      calculatedRoiAmount =
        (parseFloat(roiPercent) / 100) * parseFloat(minAmount);
    }

    const updatedOpportunity = await prisma.investmentOpportunity.update({
      where: { id },
      data: {
        name,
        description,
        brandName,
        minAmount: parseFloat(minAmount),
        maxAmount: maxAmount ? parseFloat(maxAmount) : null,
        roiPercent: parseFloat(roiPercent),
        lockInMonths: parseInt(lockInMonths, 10),
        turnOverPercentage: turnOverPercentage
          ? parseFloat(turnOverPercentage)
          : null,
        turnOverAmount: calculatedRoiAmount,
        exitOptions,
        payoutMode,
        renewalFee: parseFloat(renewalFee),
        isActive: true,

        // flags
        isMasterFranchise,
        isSignature,
        signatureStoreLocation,
        isStockist,

        // relations
        investmentType: { connect: { id: investmentTypeId } },
        businessCategory: { connect: { id: businessCategoryId } },

        // 🔑 Stockist territories via M:N `territories`
        // - If Stockist on: set to given list
        // - If Stockist off: clear
        territories: {
          set:
            isStockist && selectedStockistTerritoryIds.length > 0
              ? selectedStockistTerritoryIds.map((tid) => ({ id: tid }))
              : [],
        },
      },
    });

    // Existing branch sync (unchanged)
    if (selectedBranchIds && selectedBranchIds.length > 0) {
      await prisma.opportunityBranch.deleteMany({ where: { opportunityId: id } });
      await prisma.opportunityBranch.createMany({
        data: selectedBranchIds.map((branchId) => ({ opportunityId: id, branchId })),
      });
    }

    // Existing Master Franchise territory sync (kept as-is)
    if (isMasterFranchise && Array.isArray(selectedTerritoryIds)) {
      await prisma.territoryMaster.deleteMany({ where: { opportunityId: id } });
      if (selectedTerritoryIds.length) {
        await prisma.territoryMaster.createMany({
          data: selectedTerritoryIds.map((territoryId) => ({ opportunityId: id, territoryId })),
          skipDuplicates: true,
        });
      }
    } else {
      // If Master turned off, clear the master mappings
      await prisma.territoryMaster.deleteMany({ where: { opportunityId: id } });
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
