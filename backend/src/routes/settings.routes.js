import express from "express";
import * as settingsController from "../controller/settings.controller.js";
import { verifyToken } from "../middlewares/tokenVerification.js";
import { checkPermission } from "../middlewares/checkPermission.js";

const router = express.Router();

// {{investmentType}}
router.get(
  "/investment-types",
  verifyToken,
  checkPermission("Settings:view"),
  settingsController.getAllInvestmentTypes
);
router.get(
  "/investment-types/:id",
  verifyToken,
  checkPermission("Settings:view"),
  settingsController.getInvestmentTypeDetails
);
router.post(
  "/investment-types",
  verifyToken,
  checkPermission("Settings:create"),
  settingsController.createInvestmentType
);
router.put(
  "/investment-types/:id",
  verifyToken,
  checkPermission("Settings:update"),
  settingsController.updateInvestmentType
);
router.delete(
  "/investment-types/:id",
  verifyToken,
  checkPermission("Settings:delete"),
  settingsController.deleteInvestmentType
);

// {{businessCategory}}
router.get(
  "/business-categories",
  verifyToken,
  checkPermission("Settings:view"),
  settingsController.getAllBusinessCategories
);
router.get(
  "/business-categories/:id",
  verifyToken,
  checkPermission("Settings:view"),
  settingsController.getBusinessCategoryDetails
);
router.post(
  "/business-categories",
  verifyToken,
  checkPermission("Settings:create"),
  settingsController.createBusinessCategory
);
router.put(
  "/business-categories/:id",
  verifyToken,
  checkPermission("Settings:update"),
  settingsController.updateBusinessCategory
);
router.delete(
  "/business-categories/:id",
  verifyToken,
  checkPermission("Settings:delete"),
  settingsController.deleteBusinessCategory
);

export default router;
