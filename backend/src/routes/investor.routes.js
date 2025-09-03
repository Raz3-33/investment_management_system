import express from "express";
import * as investorController from "../controller/investor.controller.js";
import { verifyToken } from "../middlewares/tokenVerification.js";
import { checkPermission } from "../middlewares/checkPermission.js";

const router = express.Router();

router.get(
  "/",
  verifyToken,
  checkPermission("Investor:view"),
  investorController.getAllInvestors
);
router.get(
  "/:id",
  verifyToken,
  checkPermission("Investor:view"),
  investorController.getInvestorById
);
router.post(
  "/",
  verifyToken,
  checkPermission("Investor:create"),
  investorController.createInvestor
);
router.put(
  "/:id",
  verifyToken,
  checkPermission("Investor:update"),
  investorController.updateInvestor
);
router.delete(
  "/:id",
  verifyToken,
  checkPermission("Investor:delete"),
  investorController.deleteInvestor
);

export default router;
