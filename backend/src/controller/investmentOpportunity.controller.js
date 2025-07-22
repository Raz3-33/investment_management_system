import { body, validationResult } from "express-validator";
import * as investmentOpportunityService from "../services/investmentOpportunity.service.js";


// Validation logic for creating and updating investment opportunities
export const validateInvestmentOpportunity = [
  body("name").notEmpty().withMessage("Name is required"),
  body("investmentTypeId").notEmpty().withMessage("Investment Type is required"),
  body("businessCategoryId").notEmpty().withMessage("Business Category is required"),
  body("minAmount").isNumeric().withMessage("Minimum Amount must be a number"),
  body("roiPercent").isNumeric().withMessage("ROI Percent must be a number"),
];

// Get all investment opportunities
export const getAllInvestmentOpportunities = async (req, res) => {
  try {
    const opportunities = await investmentOpportunityService.getAllInvestmentOpportunities();
    res.status(200).json({ success: true, data: opportunities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get an investment opportunity by ID
export const getInvestmentOpportunityById = async (req, res) => {
  try {
    const opportunity = await investmentOpportunityService.getInvestmentOpportunityById(req.params.id);
    res.status(200).json({ success: true, data: opportunity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// Create a new investment opportunity
export const createInvestmentOpportunity = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const newOpportunity = await investmentOpportunityService.createInvestmentOpportunity(req.body);
    res.status(201).json({ success: true, data: newOpportunity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update an existing investment opportunity
export const updateInvestmentOpportunity = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const updatedOpportunity = await investmentOpportunityService.updateInvestmentOpportunity(req.params.id, req.body);
    res.status(200).json({ success: true, data: updatedOpportunity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete an investment opportunity
export const deleteInvestmentOpportunity = async (req, res) => {
  try {
    await investmentOpportunityService.deleteInvestmentOpportunity(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
