import { prisma } from "../config/db.js";

export const createInvestment = async (data) => {
  const {
    amount,
    investorId,
    opportunityId,
    payoutMode,
    contractStart,
    contractEnd,
    paymentMethod,
    agreementSigned,
    coolOffPeriod,
    status,
    // selectedBranchId, 
  } = data;

  console.log({amount,
    investorId,
    opportunityId,
    payoutMode,
    contractStart,
    contractEnd,
    paymentMethod,
    agreementSigned,
    coolOffPeriod,
    status},"================================================");
  

  // Convert amount to proper type
  const amountFloat = parseFloat(amount);

  // Ensure the dates are valid Date objects
  const contractStartDate = new Date(contractStart);
  const contractEndDate = new Date(contractEnd);
  const coolOffPeriodDate = new Date(coolOffPeriod); // Convert to Date object

  // Validate input data
  if (isNaN(amountFloat) || amountFloat <= 0) {
    throw new Error("Invalid amount: It should be a positive number.");
  }
  if (!investorId || !opportunityId) {
    throw new Error("Investor ID and Opportunity ID are required.");
  }
  if (!payoutMode || !["Monthly", "Quarterly", "Yearly"].includes(payoutMode)) {
    throw new Error(
      "Invalid payout mode: It should be one of 'Monthly', 'Quarterly', or 'Yearly'."
    );
  }
  if (
    isNaN(contractStartDate.getTime()) ||
    isNaN(contractEndDate.getTime()) ||
    contractEndDate <= contractStartDate
  ) {
    throw new Error(
      "Invalid contract dates: Ensure the contract end date is after the start date."
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

  // if (!selectedBranchId) {
  //   throw new Error("Branch ID is required.");
  // }

  try {
    // Create a new investment record in the database
    const newInvestment = await prisma.investment.create({
      data: {
        amount: amountFloat,
        investorId: investorId,
        opportunityId: opportunityId,
        payoutMode,
        contractStart: contractStartDate,
        contractEnd: contractEndDate,
        paymentMethod,
        agreementSigned,
        coolOffPeriod: coolOffPeriodDate,
        status,
        date: new Date(),
        // Directly assign the selectedBranchId relation
        // branchId:selectedBranchId, // Connect the single branch
      },
    });

    return newInvestment;
  } catch (error) {
    throw new Error("Error creating investment: " + error.message);
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
  const {
    amount,
    investorId,
    opportunityId,
    payoutMode,
    contractStart,
    contractEnd,
    paymentMethod,
    agreementSigned,
    status,
    coolOffPeriod,
    selectedBranchId, // Add branch ID field
  } = data;

  // Convert amount to proper type
  const amountFloat = parseFloat(amount);

  // Ensure the dates are valid Date objects
  const contractStartDate = new Date(contractStart); // Convert to Date object
  const contractEndDate = new Date(contractEnd); // Convert to Date object
  const coolOffPeriodDate = new Date(coolOffPeriod); // Convert to Date object

  // Validate input data
  if (isNaN(amountFloat) || amountFloat <= 0) {
    throw new Error("Invalid amount: It should be a positive number.");
  }
  if (!investorId || !opportunityId) {
    throw new Error("Investor ID and Opportunity ID are required.");
  }
  if (!payoutMode || !["Monthly", "Quarterly", "Yearly"].includes(payoutMode)) {
    throw new Error(
      "Invalid payout mode: It should be one of 'Monthly', 'Quarterly', or 'Yearly'."
    );
  }
  if (
    isNaN(contractStartDate.getTime()) ||
    isNaN(contractEndDate.getTime()) ||
    contractEndDate <= contractStartDate
  ) {
    throw new Error(
      "Invalid contract dates: Ensure the contract end date is after the start date."
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

  // Validate that branchId is present (since it is required)
  if (!selectedBranchId) {
    throw new Error("Branch ID is required.");
  }

  try {
    // Update the existing investment record in the database
    const updatedInvestment = await prisma.investment.update({
      where: { id },
      data: {
        amount: amountFloat,
        investorId,
        opportunityId,
        payoutMode,
        contractStart: contractStartDate, // Store as Date object
        contractEnd: contractEndDate, // Store as Date object
        paymentMethod,
        agreementSigned,
        status,
        coolOffPeriod: coolOffPeriodDate,
        date: new Date(), // Assuming this is the current date when updating the investment
        branchId: selectedBranchId, // Update the branch ID as well
      },
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
