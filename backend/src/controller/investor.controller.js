import { body, validationResult } from "express-validator";

import * as investorService from "../services/investor.service.js"; 


// Validator middleware
export const validateInvestor = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Email is required"),
  // Add more validations as needed
];

// In the controller, validate the request body
export const createInvestor = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const newInvestor = await investorService.createInvestor(req.body);
    res.status(201).json({ success: true, data: newInvestor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all investors
export const getAllInvestors = async (req, res) => {
  try {
    const investors = await investorService.getAllInvestors();
    res.status(200).json({ success: true, data: investors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get investor by ID
export const getInvestorById = async (req, res) => {
  try {
    const investor = await investorService.getInvestorById(req.params.id);
    if (!investor) {
      return res.status(404).json({ success: false, message: "Investor not found" });
    }
    res.status(200).json({ success: true, data: investor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update investor
export const updateInvestor = async (req, res) => {
  try {
    const updatedInvestor = await investorService.updateInvestor(req.params.id, req.body);
    res.status(200).json({ success: true, data: updatedInvestor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete investor
export const deleteInvestor = async (req, res) => {
  try {
    await investorService.deleteInvestor(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
