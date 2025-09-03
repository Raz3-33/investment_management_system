import express from "express";
import * as branchController from "../controller/branch.controller.js";
import { verifyToken } from "../middlewares/tokenVerification.js";
import { checkPermission } from "../middlewares/checkPermission.js";

const router = express.Router();

router.get("/", verifyToken, checkPermission("Settings:view"), branchController.getAll);
router.get("/:id", verifyToken, checkPermission("Settings:view"), branchController.getBranchById);
router.post("/", verifyToken, checkPermission("Settings:create"), branchController.createBranch);
router.put("/:id", verifyToken, checkPermission("Settings:update"), branchController.updateBranch);
router.delete("/:id", verifyToken, checkPermission("Settings:delete"), branchController.deleteBranch);

export default router;
