import express from "express";
import * as brandController from "../controller/brand.controller.js";
import { verifyToken } from "../middlewares/tokenVerification.js";
import { checkPermission } from "../middlewares/checkPermission.js";

const router = express.Router();

router.get("/", verifyToken, checkPermission("Settings:view"), brandController.getAll);
router.get("/:id", verifyToken, checkPermission("Settings:view"), brandController.getBrandById);
router.post("/", verifyToken, checkPermission("Settings:create"), brandController.createBrand);
router.put("/:id", verifyToken, checkPermission("Settings:update"), brandController.updateBrand);
router.delete("/:id", verifyToken, checkPermission("Settings:delete"), brandController.deleteBrand);

export default router;
