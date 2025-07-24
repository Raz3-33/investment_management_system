import express from "express";
import { createPayout, deletePayoutController, getPayouts, updatePayout } from "../controller/payout.controller.js";

const router = express.Router();

// Create a new payout
router.post("/create", createPayout);

// Get all payouts for an investment
router.get("/", getPayouts);

// Update payout details
router.put("/:payoutId", updatePayout);

router.delete("/:payoutId", deletePayoutController);

export default router;
