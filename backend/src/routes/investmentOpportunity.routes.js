import express from "express";
import * as investmentOpportunityController from "../controller/investmentOpportunity.controller.js";
import { validateInvestmentOpportunity } from "../controller/investmentOpportunity.controller.js";

const router = express.Router();

// Get all investment opportunities
router.get("/", investmentOpportunityController.getAllInvestmentOpportunities);

// Get investment opportunity by ID
router.get(
  "/:id",
  investmentOpportunityController.getInvestmentOpportunityById
);

// Create a new investment opportunity
router.post(
  "/",
  validateInvestmentOpportunity,
  investmentOpportunityController.createInvestmentOpportunity
);

// Update an investment opportunity
router.put(
  "/:id",
  validateInvestmentOpportunity,
  investmentOpportunityController.updateInvestmentOpportunity
);

// Delete an investment opportunity
router.delete(
  "/:id",
  investmentOpportunityController.deleteInvestmentOpportunity
);

export default router;
