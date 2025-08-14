import * as territoryService from "../services/territory.service.js";

// Get all
export const getAll = async (req, res) => {
  try {
    const territories = await territoryService.getAll();
    res.json({ success: true, data: territories });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch territories",
      error: error.message,
    });
  }
};

// Get by ID
export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const territory = await territoryService.getById(id);
    if (!territory) {
      return res.status(404).json({ success: false, message: "Territory not found" });
    }
    res.json({ success: true, data: territory });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch territory",
      error: error.message,
    });
  }
};

// Create
export const create = async (req, res) => {
  try {
    const newTerritory = await territoryService.create(req.body);
    res.status(201).json({ success: true, data: newTerritory });
  } catch (error) {
    const status = /already exists|validation/i.test(error.message) ? 400 : 500;
    res.status(status).json({
      success: false,
      message: "Failed to create territory",
      error: error.message,
    });
  }
};

// Update
export const update = async (req, res) => {
  try {
    const updated = await territoryService.update(req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (error) {
    const status = /not found|validation/i.test(error.message) ? 400 : 500;
    res.status(status).json({
      success: false,
      message: "Failed to update territory",
      error: error.message,
    });
  }
};

// Delete
export const removeTerritory = async (req, res) => {
  try {
    await territoryService.remove(req.params.id);
    res.sendStatus(204);
  } catch (error) {
    const status = /assigned/i.test(error.message) ? 409 : 500;
    res.status(status).json({
      success: false,
      message: "Failed to delete territory",
      error: error.message,
    });
  }
};
