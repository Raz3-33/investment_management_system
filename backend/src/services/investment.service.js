import { prisma } from "../config/db.js";

export const createInvestment = async (data) => {
  // Destructure required fields from input data
  const {
    amount,
    investorId,
    opportunityId,
    roiPercent,
    payoutMode,
    contractStart,
    contractEnd,
    paymentMethod,
    agreementSigned,
    status,
  } = data;

  // Validate input data
  if (!amount || isNaN(amount) || amount <= 0) {
    throw new Error("Invalid amount: It should be a positive number.");
  }
  if (!investorId || !opportunityId) {
    throw new Error("Investor ID and Opportunity ID are required.");
  }
  if (!roiPercent || isNaN(roiPercent) || roiPercent <= 0) {
    throw new Error("Invalid ROI Percent: It should be a positive number.");
  }
  if (!payoutMode || !["Monthly", "Quarterly", "Yearly"].includes(payoutMode)) {
    throw new Error(
      "Invalid payout mode: It should be one of 'Monthly', 'Quarterly', or 'Yearly'."
    );
  }
  if (
    !contractStart ||
    !contractEnd ||
    new Date(contractEnd) <= new Date(contractStart)
  ) {
    throw new Error(
      "Invalid dates: Contract end date should be after the start date."
    );
  }
  if (!paymentMethod) {
    throw new Error("Payment Method is required.");
  }
  if (typeof agreementSigned !== "boolean") {
    throw new Error("Agreement Signed should be a boolean value.");
  }
  if (!status || !["Ongoing", "Completed", "Canceled"].includes(status)) {
    throw new Error(
      "Invalid status: It should be one of 'Ongoing', 'Completed', or 'Canceled'."
    );
  }

  // Log the creation attempt for monitoring
  console.log(
    `Attempting to create a new investment for investor: ${investorId} with opportunity: ${opportunityId}`
  );

  try {
    // Create a new investment record in the database
    const newInvestment = await prisma.investment.create({
      data: {
        amount,
        investorId,
        opportunityId,
        roiPercent,
        payoutMode,
        contractStart,
        contractEnd,
        paymentMethod,
        agreementSigned,
        status,
      },
    });

    // Log the success for tracking
    console.log(`Investment created successfully: ${newInvestment.id}`);

    // Return the newly created investment data
    return newInvestment;
  } catch (error) {
    // Log the error and rethrow it for handling in the calling code
    console.error("Error creating investment:", error);
    throw new Error(`Error creating investment: ${error.message}`);
  }
};

// Get all investments
export const getAllInvestments = async () => {
  try {
    const investments = await prisma.investment.findMany({
      include: {
        investor: true,
        opportunity: true,
        createdBy: true,
      },
    });

    return investments;
  } catch (error) {
    throw new Error("Error fetching investments: " + error.message);
  }
};

// Get an investment by ID
export const getInvestmentById = async (id) => {
  try {
    const investment = await prisma.investment.findUnique({
      where: { id },
      include: {
        investor: true,
        opportunity: true,
        createdBy: true,
      },
    });

    return investment;
  } catch (error) {
    throw new Error("Error fetching investment: " + error.message);
  }
};

// Update an investment
export const updateInvestment = async (id, data) => {
  try {
    const updatedInvestment = await prisma.investment.update({
      where: { id },
      data,
    });

    return updatedInvestment;
  } catch (error) {
    throw new Error("Error updating investment: " + error.message);
  }
};

// Delete an investment
export const deleteInvestment = async (id) => {
  try {
    const deletedInvestment = await prisma.investment.delete({
      where: { id },
    });

    return deletedInvestment;
  } catch (error) {
    throw new Error("Error deleting investment: " + error.message);
  }
};
