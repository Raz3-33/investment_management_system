import { prisma } from "../config/db.js";

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
