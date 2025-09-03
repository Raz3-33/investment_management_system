import express from "express";
import * as investmentController from "../controller/investment.controller.js";
import { verifyToken } from "../middlewares/tokenVerification.js";
import { checkPermission } from "../middlewares/checkPermission.js";

const router = express.Router();

router.post("/", verifyToken, checkPermission("Investment:create"), investmentController.createInvestment);
router.get("/", verifyToken, checkPermission("Investment:view"), investmentController.getAllInvestments);
router.get("/:id", verifyToken, checkPermission("Investment:view"), investmentController.getInvestmentById);
router.put("/:id", verifyToken, checkPermission("Investment:update"), investmentController.updateInvestment);
router.delete("/:id", verifyToken, checkPermission("Investment:delete"), investmentController.deleteInvestment);

export default router;
