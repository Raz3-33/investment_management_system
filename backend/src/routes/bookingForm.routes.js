import express from "express";
import * as bookingFormController from "../controller/bookingForm.controller.js";
import { verifyToken } from "../middlewares/tokenVerification.js";

const router = express.Router();

// GET /api/bookings - list all bookings
router.get("/", bookingFormController.getAllBookings);

// GET /api/bookings/:id - get booking by ID
router.get("/:id", bookingFormController.getBookingById);

router.put("/payments/approval/:id",verifyToken, bookingFormController.updatePaymentApproval);

export default router;
