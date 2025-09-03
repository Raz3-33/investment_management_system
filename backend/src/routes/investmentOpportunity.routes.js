import express from "express";
import * as investmentOpportunityController from "../controller/investmentOpportunity.controller.js";
import { validateInvestmentOpportunity } from "../controller/investmentOpportunity.controller.js";
import { verifyToken } from "../middlewares/tokenVerification.js";
import { checkPermission } from "../middlewares/checkPermission.js";

const router = express.Router();

// All opportunities
router.get(
  "/",
  verifyToken,
  checkPermission("Investment:view"),
  investmentOpportunityController.getAllInvestmentOpportunities
);

// By ID
router.get(
  "/:id",
  verifyToken,
  checkPermission("Investment:view"),
  investmentOpportunityController.getInvestmentOpportunityById
);

// Create
router.post(
  "/",
  verifyToken,
  checkPermission("Investment:create"),
  validateInvestmentOpportunity,
  investmentOpportunityController.createInvestmentOpportunity
);

// Update
router.put(
  "/:id",
  verifyToken,
  checkPermission("Investment:update"),
  validateInvestmentOpportunity,
  investmentOpportunityController.updateInvestmentOpportunity
);

// Delete
router.delete(
  "/:id",
  verifyToken,
  checkPermission("Investment:delete"),
  investmentOpportunityController.deleteInvestmentOpportunity
);

// Extra fetch
router.get(
  "/opportunityBranches/:opportunityId",
  verifyToken,
  checkPermission("Investment:view"),
  investmentOpportunityController.getInvestmentOpportunityWithBranches
);

export default router;