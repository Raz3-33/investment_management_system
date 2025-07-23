import * as investmentService from "../services/investment.service.js";

// Create a new investment
export const createInvestment = async (req, res) => {
  try {
    const newInvestment = await investmentService.createInvestment(req.body);
    res.status(201).json({ success: true, data: newInvestment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all investments
export const getAllInvestments = async (req, res) => {
  try {
    const investments = await investmentService.getAllInvestments();
    res.status(200).json({ success: true, data: investments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get an investment by ID
export const getInvestmentById = async (req, res) => {
  try {
    const investment = await investmentService.getInvestmentById(req.params.id);
    res.status(200).json({ success: true, data: investment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update an investment
export const updateInvestment = async (req, res) => {
  try {
    const updatedInvestment = await investmentService.updateInvestment(
      req.params.id,
      req.body
    );
    res.status(200).json({ success: true, data: updatedInvestment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete an investment
export const deleteInvestment = async (req, res) => {
  try {
    await investmentService.deleteInvestment(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};