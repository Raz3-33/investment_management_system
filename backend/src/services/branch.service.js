import { prisma } from "../config/db.js"; // Prisma configuration
import { v4 as uuidv4 } from "uuid";

// Get all branches
export const getAllBranches = async () => {
  try {
    return await prisma.branch.findMany(); // Fetch all branches from the database
  } catch (error) {
    throw new Error("Error fetching branches: " + error.message);
  }
};

// Get a branch by ID
export const getBranchById = async (id) => {
  try {
    return await prisma.branch.findUnique({
      where: { id },
    });
  } catch (error) {
    throw new Error("Error fetching branch: " + error.message);
  }
};

// Create a new branch
export const createBranch = async (branchData) => {
  const { name, location } = branchData;

  try {
    // Check if the branch already exists using findFirst
    const existingBranch = await prisma.branch.findFirst({
      where: { name },
    });

    if (existingBranch) {
      throw new Error("Branch with the same name already exists");
    }

    // Create a new branch
    const newBranch = await prisma.branch.create({
      data: {
        id: uuidv4(),
        name,
        location,
      },
    });

    return newBranch;
  } catch (error) {
    throw new Error("Error creating branch: " + error.message);
  }
};

// Update an existing branch
export const updateBranch = async (id, branchData) => {
  const { name, location } = branchData;

  try {
    // Check if the branch exists
    const existingBranch = await prisma.branch.findUnique({
      where: { id },
    });

    if (!existingBranch) {
      throw new Error("Branch not found");
    }

    // Update the branch
    const updatedBranch = await prisma.branch.update({
      where: { id },
      data: {
        name,
        location,
      },
    });

    return updatedBranch;
  } catch (error) {
    throw new Error("Error updating branch: " + error.message);
  }
};

// Delete a branch
export const deleteBranch = async (id) => {
  try {
    // Check if there are any users assigned to the branch
    const branch = await prisma.branch.findUnique({
      where: { id },
      include: {
        users: true, // Include users related to the branch
      },
    });

    if (branch.users.length > 0) {
      throw new Error("Cannot delete branch as it has assigned users.");
    }

    // Proceed to delete the branch if no users are assigned
    await prisma.branch.delete({
      where: { id },
    });
  } catch (error) {
    throw new Error("Error deleting branch: " + error.message);
  }
};
