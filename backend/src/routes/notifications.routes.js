import express from "express";
import * as ctrl from "../controller/notifications.controller.js";
import { verifyToken } from "../middlewares/tokenVerification.js";
import { checkPermission } from "../middlewares/checkPermission.js";
import { checkRoleTabAccess } from "../middlewares/checkRoleTabAccess.js";

// You can tune permission names as you wish:
const router = express.Router();
router.get(
  "/summary",
  verifyToken,
  // checkPermission("Notifications:view"),
  checkRoleTabAccess,
  ctrl.getSummary
);
router.get(
  "/list",
  verifyToken,
  // checkPermission("Notifications:view"),
  checkRoleTabAccess,
  ctrl.getList
);

export default router;
