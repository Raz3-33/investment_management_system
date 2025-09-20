import * as bookingFormService from "../services/bookingForm.service.js";
import fs from "fs";
import sanitizedConfig from "../config.js";
import { uploadFileToS3, deleteFileFromS3ByUrl } from "../utils/s3Utils.js";
import { prisma } from "../config/db.js";

// Get all bookings
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await bookingFormService.getAllBookings();
    res.status(200).json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get a booking by ID
export const getBookingById = async (req, res) => {
  try {
    const booking = await bookingFormService.getBookingById(req.params.id);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }
    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update Payment Approval (Token Approval)
export const updatePaymentApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvalKey, status } = req.body;
    const user = req.user;
    const bookingPayment = await bookingFormService.updatePaymentApproval(
      id,
      approvalKey,
      status,
      user
    );

    if (!bookingPayment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment record not found" });
    }
    res.status(200).json({ success: true, data: bookingPayment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Convert Booking to Investment
export const convertToInvestment = async (req, res) => {
  try {
    const { personalDetailsId } = req.params;
    const userId = req.user?.id || null; // If user is authenticated
    const result = await bookingFormService.convertToInvestment({
      personalDetailsId,
      createdById: userId,
    });
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    const code = /not found|missing|required|invalid/i.test(error.message)
      ? 400
      : /duplicate|exists|already/i.test(error.message)
      ? 409
      : 500;
    return res.status(code).json({
      success: false,
      message: error.message || "Failed to convert to investment",
    });
  }
};

// Mark Territory as Booked
export const markTerritoryBooked = async (req, res) => {
  try {
    const { personalDetailsId } = req.params;
    const result = await bookingFormService.markTerritoryBooked({
      personalDetailsId,
      user: req.user,
    });

    if (!result.success) {
      return res
        .status(result.statusCode || 400)
        .json({ success: false, message: result.message });
    }

    return res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Unmark Territory as Booked (Revoke Booking)
export const unmarkTerritoryBooked = async (req, res) => {
  try {
    const { personalDetailsId } = req.params; // Get the personal details ID from the route
    const result = await bookingFormService.unmarkTerritoryBooked({
      personalDetailsId,
      user: req.user, // Pass the current user from the request
    });

    if (!result.success) {
      return res
        .status(result.statusCode || 400)
        .json({ success: false, message: result.message });
    }

    return res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    console.error("Error in unmarkTerritoryBooked:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Approve Document
// Controller update for document approval
export const updateDocumentApproval = async (req, res) => {
  try {
    const { personalDetailsId } = req.params;
    const { docKey, status } = req.body; // status: "Approved" | "Pending"
    const result = await bookingFormService.updateDocumentApproval(
      personalDetailsId,
      docKey,
      status,
      req.user
    );

    if (!result.success) {
      return res.status(result.statusCode || 400).json({
        success: false,
        message: result.message || "Failed to update document approval",
      });
    }

    return res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Approve Scheduled Payment
export const updateScheduledPaymentApproval = async (req, res) => {
  try {
    const { id } = req.params; // schedule row id
    const { status } = req.body; // "Approved" | "Pending"
    const result = await bookingFormService.updateScheduledPaymentApproval(
      id,
      status,
      req.user
    );

    if (!result.success) {
      return res
        .status(result.statusCode || 400)
        .json({ success: false, message: result.message });
    }

    return res.status(200).json({ success: true, data: result.data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// controller/bookingForm.controller.js
export const replaceDocumentFile = async (req, res) => {
  try {
    const { personalDetailsId, docKey } = req.params;

    // whitelist of editable doc fields
    const validDocKeys = new Set([
      "aadharFront",
      "aadharBack",
      "panCard",
      "companyPan",
      "addressProof",
      "attachedImage",
      // if you later want to support 'paymentProof' edit, add here too
    ]);

    if (!validDocKeys.has(docKey)) {
      return res.status(400).json({
        success: false,
        message: `Invalid docKey "${docKey}"`,
      });
    }
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "File is required" });
    }

    // Load current record
    const existing = await prisma.bookingFormPersonalDetails.findUnique({
      where: { id: personalDetailsId },
      select: {
        id: true,
        [docKey]: true,
      },
    });
    if (!existing) {
      // cleanup tmp file
      try {
        fs.unlinkSync(req.file.path);
      } catch {}
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    // Read buffer from disk (you already use disk storage)
    const buffer = fs.readFileSync(req.file.path);

    // Upload to S3
    const newUrl = await uploadFileToS3(
      {
        buffer,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
      },
      sanitizedConfig.S3_BUCKET_NAME
    );

    // Remove temp file
    try {
      fs.unlinkSync(req.file.path);
    } catch {}

    // Map docKey -> approval flag to reset
    const docKeyToApproval = {
      aadharFront: "aadharFrontIsApproved",
      aadharBack: "aadharBackIsApproved",
      panCard: "panCardIsApproved",
      companyPan: "companyPanIsApproved",
      addressProof: "addressProofIsApproved",
      attachedImage: "attachedImageIsApproved",
    };
    const approvalField = docKeyToApproval[docKey];

    // Update row with new URL & reset approval to false
    const updated = await prisma.bookingFormPersonalDetails.update({
      where: { id: personalDetailsId },
      data: {
        [docKey]: newUrl,
        ...(approvalField ? { [approvalField]: false } : {}),
      },
      select: {
        id: true,
        [docKey]: true,
        ...(approvalField ? { [approvalField]: true } : {}),
      },
    });

    // Delete the old file from S3 (best-effort)
    const oldUrl = existing[docKey];
    if (oldUrl && oldUrl !== newUrl) {
      try {
        await deleteFileFromS3ByUrl(oldUrl);
      } catch (e) {
        // log and continue; don't fail the request
        console.error("S3 delete failed for", oldUrl, e?.message);
      }
    }

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error("replaceDocumentFile error:", err);
    return res
      .status(500)
      .json({ success: false, message: err.message || "Upload failed" });
  }
};
