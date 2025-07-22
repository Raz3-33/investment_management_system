import express from "express";
import * as settingsController from "../controller/settings.controller.js";

const router = express.Router();

// {{investmentType}}
router.get("/investment-types", settingsController.getAllInvestmentTypes);
router.get("/investment-types/:id", settingsController.getInvestmentTypeDetails);
router.post("/investment-types", settingsController.createInvestmentType);
router.put("/investment-types/:id", settingsController.updateInvestmentType);
router.delete("/investment-types/:id", settingsController.deleteInvestmentType);

// {{businessCategory}}
router.get("/business-categories", settingsController.getAllBusinessCategories);
router.get(
  "/business-categories/:id",
  settingsController.getBusinessCategoryDetails
);
router.post("/business-categories", settingsController.createBusinessCategory);
router.put("/business-categories/:id", settingsController.updateBusinessCategory);
router.delete(
  "/business-categories/:id",
  settingsController.deleteBusinessCategory
);

export default router;
