import { prisma } from "../config/db.js";

export const DashboardService = async (data) => {
  // Get total counts
  const userCount = await prisma.user.count();
  const investorCount = await prisma.investor.count();
  const investmentCount = await prisma.investment.count();

  // Analyze payouts
  // Use correct field names for aggregate
  const totalPayoutAmountResult = await prisma.payout.aggregate({
    _sum: {
      amountDue: true,
      amountPaid: true,
    },
    _count: {
      id: true,
    },
    _max: {
      amountDue: true,
      amountPaid: true,
    },
    _min: {
      amountDue: true,
      amountPaid: true,
    },
  });

  const totalAmountDue = totalPayoutAmountResult._sum.amountDue || 0;
  const totalAmountPaid = totalPayoutAmountResult._sum.amountPaid || 0;
  const totalPayouts = totalPayoutAmountResult._count.id || 0;
  const maxAmountDue = totalPayoutAmountResult._max.amountDue || 0;
  const maxAmountPaid = totalPayoutAmountResult._max.amountPaid || 0;
  const minAmountDue = totalPayoutAmountResult._min.amountDue || 0;
  const minAmountPaid = totalPayoutAmountResult._min.amountPaid || 0;

  // Optionally, get the latest payout by a valid sortable field (e.g., dueDate or paidDate)
  // We'll use 'dueDate' if it exists, otherwise fallback to 'id' as a last resort
  let latestPayout = null;
  try {
    latestPayout = await prisma.payout.findFirst({
      orderBy: { dueDate: "desc" },
      select: { dueDate: true, amountDue: true, amountPaid: true, id: true },
    });
  } catch (e) {
    // fallback to id if dueDate is not available
    latestPayout = await prisma.payout.findFirst({
      orderBy: { id: "desc" },
      select: { id: true, amountDue: true, amountPaid: true },
    });
  }

  return {
    userCount,
    investorCount,
    investmentCount,
    payout: {
      totalAmountDue,
      totalAmountPaid,
      totalPayouts,
      maxAmountDue,
      maxAmountPaid,
      minAmountDue,
      minAmountPaid,
      latestPayout,
    },
  };
};
