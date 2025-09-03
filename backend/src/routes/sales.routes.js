import express from "express";
import {
  createSales,
  getSales,
  getAllSales,
  updateSales,
  deleteSales,
} from "../controller/sales.controller.js";
import { verifyToken } from "../middlewares/tokenVerification.js";
import { checkPermission } from "../middlewares/checkPermission.js";

const router = express.Router();

// Create sales
router.post(
  "/",
  verifyToken,
  checkPermission("Sales Management:create"),
  createSales
);

// Get specific sale
router.get(
  "/:salesId",
  verifyToken,
  checkPermission("Sales Management:view"),
  getSales
);

// Get all sales
router.get(
  "/",
  verifyToken,
  checkPermission("Sales Management:view"),
  getAllSales
);

// Update sale
router.put(
  "/:salesId",
  verifyToken,
  checkPermission("Sales Management:update"),
  updateSales
);

// Delete sale
router.delete(
  "/:salesId",
  verifyToken,
  checkPermission("Sales Management:delete"),
  deleteSales
);

export default router;
