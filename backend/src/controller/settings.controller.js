import * as settingsService from "../services/settings.service.js";


// {{investmentType}}

export const getAllInvestmentTypes = async (req, res) => {
  try {
    const investmentTypes = await settingsService.getAllInvestmentTypes();
    res.status(200).json({ success: true, data: investmentTypes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getInvestmentTypeDetails = async (req, res) => {
  try {
    const investmentType = await settingsService.getInvestmentTypeById(req.params.id);
    res.status(200).json({ success: true, data: investmentType });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createInvestmentType = async (req, res) => {
  try {
    const newInvestmentType = await settingsService.createInvestmentType(req.body);
    res.status(201).json({ success: true, data: newInvestmentType });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateInvestmentType = async (req, res) => {
  try {
    const updatedInvestmentType = await settingsService.updateInvestmentType(req.params.id, req.body);
    res.status(200).json({ success: true, data: updatedInvestmentType });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteInvestmentType = async (req, res) => {
  try {
    await settingsService.deleteInvestmentType(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// {{businessCategory}}


export const getAllBusinessCategories = async (req, res) => {
  try {
    const businessCategories = await settingsService.getAllBusinessCategories();
    res.status(200).json({ success: true, data: businessCategories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getBusinessCategoryDetails = async (req, res) => {
  try {
    const businessCategory = await settingsService.getBusinessCategoryById(req.params.id);
    res.status(200).json({ success: true, data: businessCategory });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createBusinessCategory = async (req, res) => {
  try {
    const newBusinessCategory = await settingsService.createBusinessCategory(req.body);
    res.status(201).json({ success: true, data: newBusinessCategory });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateBusinessCategory = async (req, res) => {
  try {
    const updatedBusinessCategory = await settingsService.updateBusinessCategory(req.params.id, req.body);
    res.status(200).json({ success: true, data: updatedBusinessCategory });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteBusinessCategory = async (req, res) => {
  try {
    await settingsService.deleteBusinessCategory(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
