import express from "express";
import { createPayout, getPayouts, updatePayout } from "../controller/payout.controller.js";

const router = express.Router();

// Create a new payout
router.post("/create", createPayout);

// Get all payouts for an investment
router.get("/:investmentId", getPayouts);

// Update payout details
router.put("/:payoutId", updatePayout);

export default router;
