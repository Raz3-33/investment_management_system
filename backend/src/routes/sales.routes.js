import express from "express";
import {
  createSales,
  getSales,
  getAllSales, // Added this import
  updateSales,
  deleteSales,
} from "../controller/sales.controller.js";
import { verifyToken } from "../middlewares/tokenVerification.js";

const router = express.Router();

// Create sales for an opportunity
router.post("/", verifyToken, createSales);

// Get all sales for an opportunity
router.get("/:salesId", verifyToken, getSales);

// Get all sales (without filtering by opportunity)
router.get("/", verifyToken, getAllSales);  // New route to fetch all sales

// Update sales for an opportunity
router.put("/:salesId", verifyToken, updateSales);

// Delete sales for an opportunity
router.delete("/:salesId", verifyToken, deleteSales);

export default router;
