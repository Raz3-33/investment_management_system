import express from "express";
import * as territoryController from "../controller/territory.controller.js";

const router = express.Router();

// Get all territories
router.get("/", territoryController.getAll);

// Get a specific territory by ID
router.get("/:id", territoryController.getById);

// Create a new territory
router.post("/", territoryController.create);

// Update an existing territory
router.put("/:id", territoryController.update);

// Delete a territory
router.delete("/:id", territoryController.removeTerritory);

export default router;
