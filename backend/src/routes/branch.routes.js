import express from "express";
import * as branchController from "../controller/branch.controller.js";

const router = express.Router();

// Get all branches
router.get("/", branchController.getAll);

// Get a specific branch by ID
router.get("/:id", branchController.getBranchById);

// Create a new branch
router.post("/", branchController.createBranch);

// Update an existing branch
router.put("/:id", branchController.updateBranch);

// Delete a branch
router.delete("/:id", branchController.deleteBranch);

export default router;
