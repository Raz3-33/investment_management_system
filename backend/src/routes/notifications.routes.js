import express from "express";
import * as ctrl from "../controller/notifications.controller.js";
import { verifyToken } from "../middlewares/tokenVerification.js";
import { checkPermission } from "../middlewares/checkPermission.js";

// You can tune permission names as you wish:
const router = express.Router();
router.get(
  "/summary",
  verifyToken,
  // checkPermission("Notifications:view"),
  ctrl.getSummary
);
router.get(
  "/list",
  verifyToken,
  checkPermission("Notifications:view"),
  ctrl.getList
);

export default router;
