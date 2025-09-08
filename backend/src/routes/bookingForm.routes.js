import express from "express";
import * as bookingFormController from "../controller/bookingForm.controller.js";
import { verifyToken } from "../middlewares/tokenVerification.js";
import { checkPermission } from "../middlewares/checkPermission.js";

const router = express.Router();

// Lists / details
router.get(
  "/",
  verifyToken,
  checkPermission("Booking Management:view"),
  bookingFormController.getAllBookings
);
router.get(
  "/:id",
  verifyToken,
  checkPermission("Booking Management:view"),
  bookingFormController.getBookingById
);

// Approvals (treat as "approve")
router.put(
  "/payments/approval/:id",
  verifyToken,
  checkPermission("Booking Management:approve"),
  bookingFormController.updatePaymentApproval
);

router.put(
  "/documents/approval/:personalDetailsId",
  verifyToken,
  checkPermission("Booking Management:approve"),
  bookingFormController.updateDocumentApproval
);

// Convert booking to investment (you can treat this as an approval step)
router.post(
  "/convert-to-investment/:personalDetailsId",
  verifyToken,
  checkPermission("Booking Management:approve"),
  bookingFormController.convertToInvestment
);

export default router;

// routes/bookingForm.routes.js
router.put(
  "/payments/scheduled/approval/:id",
  verifyToken,
  checkPermission("Booking Management:approve"),
  bookingFormController.updateScheduledPaymentApproval
);


router.post(
  "/mark-booked/:personalDetailsId",
  verifyToken,
  checkPermission("Booking Management:approve"),
  bookingFormController.markTerritoryBooked
);

