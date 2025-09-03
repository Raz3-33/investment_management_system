import express from "express";
import {
  createPayout,
  deletePayoutController,
  getPayouts,
  updatePayout,
} from "../controller/payout.controller.js";
import { verifyToken } from "../middlewares/tokenVerification.js";
import { checkPermission } from "../middlewares/checkPermission.js";

const router = express.Router();

router.post(
  "/create",
  verifyToken,
  checkPermission("Payout Management:create"),
  createPayout
);

router.get(
  "/",
  verifyToken,
  checkPermission("Payout Management:view"),
  getPayouts
);

router.put(
  "/:payoutId",
  verifyToken,
  checkPermission("Payout Management:update"),
  updatePayout
);

router.delete(
  "/:payoutId",
  verifyToken,
  checkPermission("Payout Management:delete"),
  deletePayoutController
);

export default router;
