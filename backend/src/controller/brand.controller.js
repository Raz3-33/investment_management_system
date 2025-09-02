import * as brandService from "../services/brand.service.js";

// Get all brands
export const getAll = async (req, res) => {
  try {
    const brands = await brandService.getAllBrands();
    res.json({ success: true, data: brands });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch brands",
      error: error.message,
    });
  }
};

// Get by ID
export const getBrandById = async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await brandService.getBrandById(id);

    if (!brand) {
      return res
        .status(404)
        .json({ success: false, message: "Brand not found" });
    }

    res.json({ success: true, data: brand });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch brand details",
      error: error.message,
    });
  }
};

// Create
export const createBrand = async (req, res) => {
  try {
    const brandData = req.body;
    const newBrand = await brandService.createBrand(brandData);
    res.status(201).json({ success: true, data: newBrand });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create brand",
      error: error.message,
    });
  }
};

// Update
export const updateBrand = async (req, res) => {
  const { id } = req.params;
  const brandData = req.body;

  try {
    const updatedBrand = await brandService.updateBrand(id, brandData);
    res.json({ success: true, data: updatedBrand });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update brand",
      error: error.message,
    });
  }
};

// Delete
export const deleteBrand = async (req, res) => {
  const { id } = req.params;

  try {
    await brandService.deleteBrand(id);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete brand",
      error: error.message,
    });
  }
};
