import * as branchService from "../services/branch.service.js";

// Get all branches
export const getAll = async (req, res) => {
  try {
    const branches = await branchService.getAllBranches();
    res.json({ success: true, data: branches });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch branches",
      error: error.message,
    });
  }
};

// Get a branch by ID
export const getBranchById = async (req, res) => {
  try {
    const { id } = req.params;
    const branch = await branchService.getBranchById(id);

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    res.json({ success: true, data: branch });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch branch details",
      error: error.message,
    });
  }
};

// Create a new branch
export const createBranch = async (req, res) => {
  try {
    const branchData = req.body;
    const newBranch = await branchService.createBranch(branchData);
    res.status(201).json({ success: true, data: newBranch });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create branch",
      error: error.message,
    });
  }
};

// Update an existing branch
export const updateBranch = async (req, res) => {
  const { id } = req.params;
  const branchData = req.body;

  try {
    const updatedBranch = await branchService.updateBranch(id, branchData);
    res.json({ success: true, data: updatedBranch });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update branch",
      error: error.message,
    });
  }
};

// Delete a branch
export const deleteBranch = async (req, res) => {
  const { id } = req.params;

  try {
    await branchService.deleteBranch(id);
    res.sendStatus(204); // Successfully deleted
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete branch",
      error: error.message,
    });
  }
};
