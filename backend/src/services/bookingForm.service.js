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
      paymentScheduledDetails: true,
      expectedPaymentScheduledDetails: true, // Include this in the response
    },
  });
};


// services/bookingForm.service.js (or booking.service.js)
// Assumes `prisma` is imported and available

// services/bookingForm.service.js
export const updatePaymentApproval = async (id, approvalKey, status, user) => {
  try {
    const isFinance = user?.role?.name?.toLowerCase() === "finance";
    const isAdmin = user?.isAdmin === true;
    if (!isFinance && !isAdmin) {
      return {
        success: false,
        statusCode: 403,
        message:
          "Forbidden: Only finance role or admin users can update approval",
      };
    }

    // Only token approval handled here now (legacy flags allowed but ignored in sum)
    const validApprovalKeys = ["isTokenApproved"];
    if (!validApprovalKeys.includes(approvalKey)) {
      return {
        success: false,
        statusCode: 400,
        message: `Invalid approvalKey: ${approvalKey}`,
      };
    }

    const isApproved = status === "Approved";

    const paymentDetails = await prisma.bookingFormPaymentDetails.findUnique({
      where: { id },
      include: { personalDetails: true },
    });
    if (!paymentDetails) {
      return {
        success: false,
        statusCode: 404,
        message: "Payment details not found",
      };
    }

    const personalDetailsId = paymentDetails.personalDetailsId;

    const updated = await prisma.$transaction(async (tx) => {
      // 1) Update token approval
      await tx.bookingFormPaymentDetails.update({
        where: { id },
        data: { [approvalKey]: isApproved },
      });

      // 2) Aggregate schedules for this booking
      const [totalCount, approvedCount, approvedSchedules, pdFresh] =
        await Promise.all([
          tx.paymentSceduledDetails.count({ where: { personalDetailsId } }),
          tx.paymentSceduledDetails.count({
            where: { personalDetailsId, isAmountApproved: true },
          }),
          tx.paymentSceduledDetails.findMany({
            where: { personalDetailsId, isAmountApproved: true },
            select: { amount: true },
          }),
          tx.bookingFormPaymentDetails.findUnique({
            where: { personalDetailsId },
            select: {
              id: true,
              dealAmount: true,
              tokenReceived: true,
              isTokenApproved: true,
            },
          }),
        ]);

      const approvedScheduled = approvedSchedules.reduce(
        (sum, row) => sum + Number(row.amount || 0),
        0
      );

      const dealAmount = Number(pdFresh.dealAmount || 0);
      const tokenAmount = Number(pdFresh.tokenReceived || 0);
      const tokenOk = pdFresh.isTokenApproved || tokenAmount <= 0;
      const tokenPortion = pdFresh.isTokenApproved ? tokenAmount : 0;

      let newBalanceDue = dealAmount - (tokenPortion + approvedScheduled);
      if (!Number.isFinite(newBalanceDue)) newBalanceDue = 0;
      if (newBalanceDue < 0) newBalanceDue = 0;

      const allSchedulesApproved =
        totalCount === 0 ? true : approvedCount === totalCount;
      const isPaymentCompleted = allSchedulesApproved && tokenOk;

      const updatedPayment = await tx.bookingFormPaymentDetails.update({
        where: { id: pdFresh.id },
        data: { balanceDue: newBalanceDue },
      });
      const updatedPersonal = await tx.bookingFormPersonalDetails.update({
        where: { id: personalDetailsId },
        data: { isPaymentCompleted },
      });

      return { updatedPayment, updatedPersonal };
    });

    return {
      success: true,
      data: {
        payment: updated.updatedPayment,
        personal: updated.updatedPersonal,
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
      // if (hasPendingAmount) {
      //   msgParts.push(
      //     `Pending amount: ₹${summary.pendingAmount.toLocaleString("en-IN")}`
      //   );
      // }
      // const message = msgParts.length
      //   ? msgParts.join(" | ")
      //   : "Payments are not fully approved";

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
// In your service file (e.g., bookingForm.service.js)

export const updateDocumentApproval = async (
  personalDetailsId,
  docKey,
  status,
  user
) => {
  try {
    // ---- Role check (allow finance or admin; add more if needed) ----
    const roleName = user?.role?.name?.toLowerCase?.() || "";
    const isFinance = roleName === "finance";
    const isAdmin = user?.isAdmin === true;
    const allowed =
      isFinance ||
      isAdmin; /* || roleName === "kyc" || roleName === "operations" */
    if (!allowed) {
      return {
        success: false,
        statusCode: 403,
        message:
          "Forbidden: Only finance/admin can approve or revoke documents",
      };
    }

    if (!personalDetailsId) {
      return {
        success: false,
        statusCode: 400,
        message: "personalDetailsId is required",
      };
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

    // Load record (to ensure document exists before approving or revoking)
    const pd = await prisma.bookingFormPersonalDetails.findUnique({
      where: { id: personalDetailsId },
      select: {
        id: true,
        [docKey]: true,
        [approvalField]: true,
      },
    });

    if (!pd) {
      return {
        success: false,
        statusCode: 404,
        message: "Booking personal details not found",
      };
    }

    // Optional: block approving if file/url not present
    if (!pd[docKey]) {
      return {
        success: false,
        statusCode: 400,
        message: `Cannot approve/revoke: ${docKey} is missing`,
      };
    }

    // Check if we're approving or revoking
    const isApproved = status === "Approved";
    const newStatus = isApproved ? true : false; // toggle between true and false (approve/revoke)

    // Update document approval
    const updated = await prisma.bookingFormPersonalDetails.update({
      where: { id: personalDetailsId },
      data: {
        [approvalField]: newStatus, // set the new status (true or false)
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

// services/bookingForm.service.js
export const updateScheduledPaymentApproval = async (
  scheduledId,
  status,
  user
) => {
  try {
    // Role check: finance/admin
    const isFinance = user?.role?.name?.toLowerCase() === "finance";
    const isAdmin = user?.isAdmin === true;
    if (!isFinance && !isAdmin) {
      return {
        success: false,
        statusCode: 403,
        message: "Forbidden: Only finance/admin can update schedule approval",
      };
    }

    if (!scheduledId) {
      return {
        success: false,
        statusCode: 400,
        message: "scheduledId is required",
      };
    }

    const isApproved = status === "Approved";

    // Load schedule to get personalDetailsId
    const sched = await prisma.paymentSceduledDetails.findUnique({
      where: { id: scheduledId },
      select: { id: true, personalDetailsId: true },
    });
    if (!sched) {
      return {
        success: false,
        statusCode: 404,
        message: "Schedule item not found",
      };
    }

    // Compute new balance due:
    // dealAmount - (tokenApproved? tokenReceived:0) - sum(approved schedules)
    const updated = await prisma.$transaction(async (tx) => {
      // 1) Update schedule approval
      await tx.paymentSceduledDetails.update({
        where: { id: scheduledId },
        data: { isAmountApproved: isApproved },
      });

      // 2) Read all approved schedules for this booking
      const schedules = await tx.paymentSceduledDetails.findMany({
        where: {
          personalDetailsId: sched.personalDetailsId,
          isAmountApproved: true,
        },
        select: { amount: true },
      });
      const approvedScheduled = schedules.reduce(
        (sum, row) => sum + Number(row.amount || 0),
        0
      );

      // 3) Read payment details for token/dealAmount
      const pd = await tx.bookingFormPaymentDetails.findUnique({
        where: { personalDetailsId: sched.personalDetailsId }, // unique
        select: {
          id: true,
          dealAmount: true,
          tokenReceived: true,
          isTokenApproved: true,
        },
      });
      if (!pd)
        throw new Error("Payment details not found for this schedule item");

      const dealAmount = Number(pd.dealAmount || 0);
      const tokenAmount = Number(pd.tokenReceived || 0);
      const tokenApprovedPortion = pd.isTokenApproved ? tokenAmount : 0;

      let newBalanceDue =
        dealAmount - (tokenApprovedPortion + approvedScheduled);
      if (!Number.isFinite(newBalanceDue)) newBalanceDue = 0;
      if (newBalanceDue < 0) newBalanceDue = 0;

      // 4) Persist new balance + maybe flip isPaymentCompleted
      const updatedPayment = await tx.bookingFormPaymentDetails.update({
        where: { id: pd.id },
        data: { balanceDue: newBalanceDue },
      });

      const updatedPersonal = await tx.bookingFormPersonalDetails.update({
        where: { id: sched.personalDetailsId },
        data: { isPaymentCompleted: newBalanceDue === 0 },
      });

      return { updatedPayment, updatedPersonal };
    });

    return { success: true, data: updated };
  } catch (err) {
    console.error("Error in updateScheduledPaymentApproval:", err);
    return {
      success: false,
      statusCode: 500,
      message: err.message || "Failed to update scheduled payment approval",
    };
  }
};

export const markTerritoryBooked = async ({ personalDetailsId, user }) => {
  try {
    // permission guard (reuse finance/admin like other approvals)
    const roleName = user?.role?.name?.toLowerCase?.() || "";
    const isFinance = roleName === "finance";
    const isAdmin = user?.isAdmin === true;
    if (!isFinance && !isAdmin) {
      return {
        success: false,
        statusCode: 403,
        message: "Forbidden: Only finance/admin can mark as booked",
      };
    }

    if (!personalDetailsId) {
      return {
        success: false,
        statusCode: 400,
        message: "personalDetailsId is required",
      };
    }

    const data = await prisma.$transaction(async (tx) => {
      // load the booking with payment + schedules + territory
      const booking = await tx.bookingFormPersonalDetails.findUnique({
        where: { id: personalDetailsId },
        include: {
          territory: true,
          paymentDetails: true,
          paymentScheduledDetails: true,
        },
      });

      if (!booking) {
        return {
          success: false,
          statusCode: 404,
          message: "Booking (personal details) not found",
        };
      }

      if (!booking.territoryId) {
        return {
          success: false,
          statusCode: 400,
          message: "No territory associated with this booking",
        };
      }

      // If already booked, short-circuit
      if (booking.territory?.isBooked) {
        return {
          success: true,
          data: {
            territoryId: booking.territoryId,
            isBooked: true,
            already: true,
          },
        };
      }

      // Validate payments are fully done (use same rules as convertToInvestment)
      const pd = booking.paymentDetails;
      if (!pd) {
        return {
          success: false,
          statusCode: 400,
          message: "Payment details not found for this booking",
        };
      }

      const summary = summarizePayments(pd); // should examine token + scheduled approvals + balanceDue
      const hasUnapproved = summary.pendingItems?.length > 0;
      const hasPendingAmount =
        typeof summary.pendingAmount === "number" && summary.pendingAmount > 0;

      // if (hasUnapproved || hasPendingAmount) {
      //   const msgParts = [];
      //   if (hasUnapproved) {
      //     const labels = summary.pendingItems
      //       .map((x) => `Payment ${x.index}`)
      //       .join(", ");
      //     msgParts.push(`Pending approvals: ${labels}`);
      //   }
      //   // if (hasPendingAmount) {
      //   //   msgParts.push(
      //   //     `Pending amount: ₹${summary.pendingAmount.toLocaleString("en-IN")}`
      //   //   );
      //   // }
      //   return {
      //     success: false,
      //     statusCode: 400,
      //     message:
      //       msgParts.length > 0
      //         ? msgParts.join(" | ")
      //         : "Payments are not fully approved",
      //   };
      // }

      // Flip isBooked = true
      const updated = await tx.territory.update({
        where: { id: booking.territoryId },
        data: { isBooked: true },
        select: { id: true, isBooked: true },
      });

      return { success: true, data: updated };
    });

    return data;
  } catch (err) {
    console.error("Error in markTerritoryBooked:", err);
    return {
      success: false,
      statusCode: 500,
      message: err.message || "Failed to mark as booked",
    };
  }
};

export const unmarkTerritoryBooked = async ({ personalDetailsId, user }) => {
  try {
    // Check if the user has the proper role (finance/admin)
    const roleName = user?.role?.name?.toLowerCase() || "";
    const isFinance = roleName === "finance";
    const isAdmin = user?.isAdmin === true;
    if (!isFinance && !isAdmin) {
      return {
        success: false,
        statusCode: 403,
        message: "Forbidden: Only finance/admin can unmark booking",
      };
    }

    if (!personalDetailsId) {
      return {
        success: false,
        statusCode: 400,
        message: "personalDetailsId is required",
      };
    }

    const data = await prisma.$transaction(async (tx) => {
      // Load the booking data to check if it exists and get territory details
      const booking = await tx.bookingFormPersonalDetails.findUnique({
        where: { id: personalDetailsId },
        include: {
          territory: true,
        },
      });

      if (!booking) {
        return {
          success: false,
          statusCode: 404,
          message: "Booking (personal details) not found",
        };
      }

      if (!booking.territoryId) {
        return {
          success: false,
          statusCode: 400,
          message: "No territory associated with this booking",
        };
      }

      // If already not booked, short-circuit
      if (!booking.territory?.isBooked) {
        return {
          success: true,
          data: {
            territoryId: booking.territoryId,
            isBooked: false,
            already: true,
          },
        };
      }

      // Flip isBooked to false (unmark booking)
      const updated = await tx.territory.update({
        where: { id: booking.territoryId },
        data: { isBooked: false },
        select: { id: true, isBooked: true },
      });

      return { success: true, data: updated };
    });

    return data;
  } catch (err) {
    console.error("Error in unmarkTerritoryBooked:", err);
    return {
      success: false,
      statusCode: 500,
      message: err.message || "Failed to unmark booking",
    };
  }
};

// Convert Booking to Investment
// export async function convertToInvestment({ personalDetailsId, createdById = null }) {
//   if (!personalDetailsId) throw new Error("personalDetailsId is required");

//   return prisma.$transaction(async (tx) => {
//     const booking = await tx.bookingFormPersonalDetails.findUnique({
//       where: { id: personalDetailsId },
//       include: {
//         territory: { include: { InvestmentOpportunity: true } },
//         officeDetails: {
//           include: {
//             officeBranch: true,
//             leadSuccessCoordinator: true,
//             partnerRelationshipExecutive: true,
//             salesOnboardingManager: true,
//           },
//         },
//         paymentDetails: true,
//       },
//     });

//     if (!booking) throw new Error("Booking (personal details) not found");

//     const { email, fullName, phoneNumber, state, district, city, streetAddress, pincode } = booking;
//     const opportunity = booking.territory?.InvestmentOpportunity || null;
//     const branchId = booking.officeDetails?.officeBranchId;

//     if (!opportunity || !branchId) throw new Error("Investment opportunity or branch missing");

//     // Validate payments are fully approved
//     const pd = booking.paymentDetails;
//     if (!pd) throw new Error("Payment details not found for this booking");

//     const summary = summarizePayments(pd);
//     if (summary.pendingItems.length > 0 || summary.pendingAmount > 0) {
//       throw new Error("Payments are not fully approved");
//     }

//     const address = [streetAddress, city, district, state, pincode].filter(Boolean).join(", ");
//     const randomPassword = Math.random().toString(36).slice(-10);

//     const investor = await tx.investor.upsert({
//       where: { email },
//       create: {
//         name: fullName,
//         email,
//         phone: phoneNumber || null,
//         type: "Individual",
//         address,
//         password: randomPassword,
//         status: "Pending",
//         documents: [/* Aadhar and other docs */],
//       },
//       update: { /* Update logic */ },
//     });

//     // Create Investment
//     const investment = await tx.investment.create({
//       data: {
//         investorId: investor.id,
//         opportunityId: opportunity.id,
//         createdById,
//         amount: pd.dealAmount,
//         date: pd.tokenDate || new Date(),
//         contractStart: new Date(),
//         contractEnd: addMonths(new Date(), opportunity.lockInMonths),
//         payoutMode: opportunity.payoutMode,
//         status: "Ongoing",
//         branchId,
//       },
//     });

//     return { investor, investment };
//   });
// }
