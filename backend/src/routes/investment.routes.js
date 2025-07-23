import express from "express";
import * as investmentController from "../controller/investment.controller.js";

const router = express.Router();

// Create a new investment
router.post("/", investmentController.createInvestment);

// Get all investments
router.get("/", investmentController.getAllInvestments);

// Get an investment by ID
router.get("/:id", investmentController.getInvestmentById);

// Update an investment
router.put("/:id", investmentController.updateInvestment);

// Delete an investment
router.delete("/:id", investmentController.deleteInvestment);

export default router;
