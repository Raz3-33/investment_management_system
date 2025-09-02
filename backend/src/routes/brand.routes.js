import express from "express";
import * as brandController from "../controller/brand.controller.js";

const router = express.Router();

// Get all brands
router.get("/", brandController.getAll);

// Get a specific brand by ID
router.get("/:id", brandController.getBrandById);

// Create a new brand
router.post("/", brandController.createBrand);

// Update an existing brand
router.put("/:id", brandController.updateBrand);

// Delete a brand
router.delete("/:id", brandController.deleteBrand);

export default router;
