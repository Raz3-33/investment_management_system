import express from "express";
import * as investorController from "../controller/investor.controller.js";

const router = express.Router();

// Route to get all investors
router.get("/", investorController.getAllInvestors);

// Route to get an investor by ID
router.get("/:id", investorController.getInvestorById);

// Route to create a new investor
router.post("/", investorController.createInvestor);

// Route to update an investor
router.put("/:id", investorController.updateInvestor);

// Route to delete an investor
router.delete("/:id", investorController.deleteInvestor);

export default router;
