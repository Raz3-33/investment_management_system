import { prisma } from "../config/db.js";
import { addMonths } from "date-fns";
import { summarizePayments } from "../helper/booking.helper.js";

// Fetch all bookings
export const getAllBookings = async () => {
  return prisma.bookingFormPersonalDetails.findMany({
    include: {
      officeDetails: true,
      paymentDetails: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getBookingById = async (id) => {
  return prisma.bookingFormPersonalDetails.findUnique({
    where: { id },
    include: {
      officeDetails: {
        include: {
          officeBranch: true,
          leadSuccessCoordinator: true,
          partnerRelationshipExecutive: true,
          salesOnboardingManager: true,
        },
      },
      paymentDetails: true,
      territory: true,
    },
  });
};

// services/bookingForm.service.js (or booking.service.js)
// Assumes `prisma` is imported and available

export const updatePaymentApproval = async (id, approvalKey, status, user) => {
  try {
    // ---- Role check ----
    const isFinance = user?.role?.name?.toLowerCase() === "finance";
    const isAdmin = user?.isAdmin === true;
    if (!isFinance && !isAdmin) {
      return {
        success: false,
        statusCode: 403,
        message: "Forbidden: Only finance role or admin users can update approval",
      };
    }

    // ---- Validate approvalKey ----
    const validApprovalKeys = [
      "isAmount1Approved",
      "isAmount2Approved",
      "isAmount3Approved",
      "isAmount4Approved",
    ];
    if (!validApprovalKeys.includes(approvalKey)) {
      return {
        success: false,
        statusCode: 400,
        message: `Invalid approvalKey: ${approvalKey}`,
      };
    }

    const isApproved = status === "Approved";

    // ---- Load current paymentDetails ----
    const paymentDetails = await prisma.bookingFormPaymentDetails.findUnique({
      where: { id },
      include: {
        personalDetails: true, // for isPaymentCompleted flip (optional)
      },
    });

    if (!paymentDetails) {
      return {
        success: false,
        statusCode: 404,
        message: "Payment details not found",
      };
    }

    // Map e.g. isAmount3Approved -> amount3
    const index = approvalKey.match(/\d+/)?.[0]; // "3"
    const amountField = `amount${index}`;

    // Current approval value & amount
    const alreadyApproved = Boolean(paymentDetails[approvalKey]);
    const amountValue = Number(paymentDetails[amountField] || 0);

    // ---- Build approved sum AFTER applying the requested toggle ----
    // Read all amounts and approvals
    const amounts = [1, 2, 3, 4].map((i) => Number(paymentDetails[`amount${i}`] || 0));
    const approvals = [1, 2, 3, 4].map((i) => Boolean(paymentDetails[`isAmount${i}Approved`]));

    // Apply the requested change in a copy
    const idx = Number(index) - 1; // 0-based
    approvals[idx] = isApproved;    // reflect the new state

    // Sum of approved schedule amounts
    const approvedScheduled = approvals.reduce(
      (sum, ok, i) => sum + (ok ? amounts[i] : 0),
      0
    );

    const dealAmount = Number(paymentDetails.dealAmount || 0);
    const tokenReceived = Number(paymentDetails.tokenReceived || 0);

    // Recompute new balanceDue from scratch (no drift)
    let newBalanceDue = dealAmount - (tokenReceived + approvedScheduled);
    if (!Number.isFinite(newBalanceDue)) newBalanceDue = 0;
    if (newBalanceDue < 0) newBalanceDue = 0;

    // ---- Persist updates in a transaction ----
    const updated = await prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.bookingFormPaymentDetails.update({
        where: { id },
        data: {
          [approvalKey]: isApproved,
          balanceDue: newBalanceDue,
        },
      });

      // OPTIONAL: mark the booking as fully paid
      // Flip isPaymentCompleted on BookingFormPersonalDetails when balanceDue == 0
      let updatedPersonal = null;
      if (paymentDetails.personalDetailsId) {
        updatedPersonal = await tx.bookingFormPersonalDetails.update({
          where: { id: paymentDetails.personalDetailsId },
          data: {
            isPaymentCompleted: newBalanceDue === 0,
          },
        });
      }

      return { updatedPayment, updatedPersonal };
    });

    return {
      success: true,
      data: {
        payment: updated.updatedPayment,
        personal: updated.updatedPersonal, // may be null if not updated
      },
    };
  } catch (err) {
    console.error("Error in updatePaymentApproval:", err);
    return {
      success: false,
      statusCode: 500,
      message: err.message || "Failed to update payment approval",
    };
  }
};


// services/booking.service.js

export async function convertToInvestment({
  personalDetailsId,
  createdById = null,
}) {
  if (!personalDetailsId) throw new Error("personalDetailsId is required");

  return prisma.$transaction(async (tx) => {
    // 1) Load the full booking
    const booking = await tx.bookingFormPersonalDetails.findUnique({
      where: { id: personalDetailsId },
      include: {
        territory: { include: { InvestmentOpportunity: true } },
        officeDetails: {
          include: {
            officeBranch: true,
            leadSuccessCoordinator: true,
            partnerRelationshipExecutive: true,
            salesOnboardingManager: true,
          },
        },
        paymentDetails: true,
      },
    });

    if (!booking) throw new Error("Booking (personal details) not found");
    const {
      email,
      fullName,
      phoneNumber,
      state,
      district,
      city,
      streetAddress,
      pincode,
      panCard,
      aadharFront,
      aadharBack,
      gstNumber,
      attachedImage,
      oppurtunity,
    } = booking;

    if (!email || !fullName)
      throw new Error("Booking is missing fullName or email");

    // 2) Resolve opportunity
    let opportunity = booking.territory?.InvestmentOpportunity || null;
    if (!opportunity && oppurtunity) {
      opportunity = await tx.investmentOpportunity.findFirst({
        where: { name: oppurtunity.trim() },
      });
    }
    if (!opportunity)
      throw new Error("Investment Opportunity not found for this booking");

    // 3) Resolve branch
    const branchId = booking.officeDetails?.officeBranchId;
    if (!branchId)
      throw new Error("Office branch is required to create an Investment");

    // 3.5) ***NEW***: Validate payments are fully approved/cleared
    const pd = booking.paymentDetails;
    if (!pd) throw new Error("Payment details not found for this booking");

    const summary = summarizePayments(pd);

    // Rule: block if any scheduled payment with amount > 0 is not approved
    const hasUnapproved = summary.pendingItems.length > 0;

    // Also block if pendingAmount is finite and > 0
    const hasPendingAmount =
      typeof summary.pendingAmount === "number" && summary.pendingAmount > 0;

    if (hasUnapproved || hasPendingAmount) {
      // Throw a 400 with structured info (controller maps message/status)
      const msgParts = [];
      if (hasUnapproved) {
        const labels = summary.pendingItems
          .map((x) => `Payment ${x.index}`)
          .join(", ");
        msgParts.push(`Pending approvals: ${labels}`);
      }
      if (hasPendingAmount) {
        msgParts.push(
          `Pending amount: ₹${summary.pendingAmount.toLocaleString("en-IN")}`
        );
      }
      const message = msgParts.length
        ? msgParts.join(" | ")
        : "Payments are not fully approved";

      const err = new Error(message);
      // attach details for controller (if you want to relay it)
      err.details = {
        dealAmount: summary.dealAmount,
        tokenReceived: summary.tokenReceived,
        approvedAmount: summary.approvedAmount,
        pendingAmount: summary.pendingAmount,
        pendingPayments: summary.pendingItems.map((x) => ({
          index: x.index,
          key: x.key,
          amount: x.amount,
          dueDate: x.dueDate,
        })),
      };
      throw err; // controller will map to 400
    }

    // 4) Upsert Investor (by email)
    const addressParts = [streetAddress, city, district, state, pincode].filter(
      Boolean
    );
    const address = addressParts.length ? addressParts.join(", ") : null;

    const randomPassword = Math.random().toString(36).slice(-10);

    const investor = await tx.investor.upsert({
      where: { email },
      create: {
        name: fullName,
        email,
        phone: phoneNumber || null,
        type: "Individual",
        address,
        pan: panCard || null,
        aadhaar: aadharFront || null,
        gstNumber: gstNumber || null,
        referredBy: null,
        status: "Pending",
        password: randomPassword,
        documents: [aadharFront, aadharBack, attachedImage].filter(Boolean),
      },
      update: {
        name: fullName,
        phone: phoneNumber || undefined,
        address: address ?? undefined,
        pan: panCard ?? undefined,
        gstNumber: gstNumber ?? undefined,
        documents: {
          set: undefined,
          push: [aadharFront, aadharBack, attachedImage].filter(Boolean),
        },
      },
    });

    // 5) Prevent duplicate Investment for same investor + opportunity (+ branch)
    const existingInvestment = await tx.investment.findFirst({
      where: {
        investorId: investor.id,
        opportunityId: opportunity.id,
        branchId,
      },
    });
    if (existingInvestment) {
      throw new Error(
        "Investment already exists for this investor, opportunity and branch"
      );
    }

    // 6) Build Investment fields
    const amount = Number(pd?.dealAmount || 0);
    if (!amount || amount <= 0)
      throw new Error("Deal Amount is required to create an Investment");

    const investmentDate = pd?.tokenDate || new Date();
    const payoutMode = opportunity.payoutMode || "Monthly";
    const paymentMethod = pd?.modeOfPayment || "Unknown";

    const contractStart = investmentDate;
    const lockInMonths = opportunity.lockInMonths || 0;
    const contractEnd =
      lockInMonths > 0
        ? addMonths(contractStart, lockInMonths)
        : addMonths(contractStart, 12);

    const roiPercent = opportunity.roiPercent ?? null;

    // 7) Create Investment
    const investment = await tx.investment.create({
      data: {
        investorId: investor.id,
        opportunityId: opportunity.id,
        createdById,
        amount,
        date: investmentDate,
        roiPercent,
        payoutMode,
        coolOffPeriod: null,
        contractStart,
        contractEnd,
        paymentMethod,
        agreementSigned: false,
        status: "Ongoing",
        branchId,
      },
    });

    // 8) Seed Payouts (optional): only if you still want schedule retained
    const schedules = [1, 2, 3, 4]
      .map((i) => ({
        dueDate: pd?.[`date${i}`],
        amountDue: pd?.[`amount${i}`],
      }))
      .filter((x) => x.dueDate && x.amountDue);

    if (schedules.length) {
      await tx.payout.createMany({
        data: schedules.map((s) => ({
          investmentId: investment.id,
          dueDate: s.dueDate,
          amountDue: Number(s.amountDue),
        })),
      });
    }

    return {
      investor,
      investment,
      opportunity: {
        id: opportunity.id,
        name: opportunity.name,
        brandName: opportunity.brandName,
      },
      branchId,
    };
  });
}


// services/bookingForm.service.js
export const updateDocumentApproval = async (personalDetailsId, docKey, status, user) => {
  try {
    // ---- Role check (allow finance or admin; add more if needed) ----
    const roleName = user?.role?.name?.toLowerCase?.() || "";
    const isFinance = roleName === "finance";
    const isAdmin = user?.isAdmin === true;
    // (Optionally allow ops/kyc)
    const allowed = isFinance || isAdmin /* || roleName === "kyc" || roleName === "operations" */;
    if (!allowed) {
      return {
        success: false,
        statusCode: 403,
        message: "Forbidden: Only finance/admin can approve documents",
      };
    }

    if (!personalDetailsId) {
      return { success: false, statusCode: 400, message: "personalDetailsId is required" };
    }
    if (!docKey) {
      return { success: false, statusCode: 400, message: "docKey is required" };
    }

    // Map doc key -> approval boolean key
    const docKeyToApproval = {
      aadharFront: "aadharFrontIsApproved",
      aadharBack: "aadharBackIsApproved",
      panCard: "panCardIsApproved",
      companyPan: "companyPanIsApproved",
      addressProof: "addressProofIsApproved",
      attachedImage: "attachedImageIsApproved",
      // gstNumber has no approval boolean in your schema
    };

    const approvalField = docKeyToApproval[docKey];
    if (!approvalField) {
      return {
        success: false,
        statusCode: 400,
        message: `No approval flag configured for "${docKey}"`,
      };
    }

    const isApproved = status === "Approved";

    // Load record (to ensure document exists before approving)
    const pd = await prisma.bookingFormPersonalDetails.findUnique({
      where: { id: personalDetailsId },
      select: {
        id: true,
        [docKey]: true,
        [approvalField]: true,
      },
    });

    if (!pd) {
      return { success: false, statusCode: 404, message: "Booking personal details not found" };
    }

    // Optional: block approving if file/url not present
    if (!pd[docKey]) {
      return {
        success: false,
        statusCode: 400,
        message: `Cannot approve: ${docKey} is missing`,
      };
    }

    const updated = await prisma.bookingFormPersonalDetails.update({
      where: { id: personalDetailsId },
      data: {
        [approvalField]: isApproved,
      },
      select: {
        id: true,
        [approvalField]: true,
      },
    });

    return { success: true, data: updated };
  } catch (err) {
    console.error("Error in updateDocumentApproval:", err);
    return {
      success: false,
      statusCode: 500,
      message: err.message || "Failed to update document approval",
    };
  }
};
