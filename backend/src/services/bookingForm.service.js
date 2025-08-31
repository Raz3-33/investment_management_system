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

export const updatePaymentApproval = async (id, approvalKey, status, user) => {
  try {
    // Allow if user is finance role OR isAdmin true
    const isFinance = user?.role?.name.toLowerCase() === "finance";
    const isAdmin = user?.isAdmin === true;

    if (!isFinance && !isAdmin) {
      return res.status(403).json({
        success: false,
        message:
          "Forbidden: Only finance role or admin users can update approval",
      });
    }
    const isApproved = status === "Approved";
    const updateData = { [approvalKey]: isApproved };

    return prisma.bookingFormPaymentDetails.update({
      where: { id },
      data: updateData,
    });
  } catch (err) {
    return err.message;
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
