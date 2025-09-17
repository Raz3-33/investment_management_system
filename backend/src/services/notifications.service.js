import { prisma } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

/**
 * ==========================
 * CONFIG / TUNABLES
 * ==========================
 */

// If you want to enforce payment proof for finance checks, keep true.
// Set to false if proof is optional in your workflow.
const REQUIRE_PAYMENT_PROOF_FOR_TOKEN = true;
const REQUIRE_PAYMENT_PROOF_FOR_SCHEDULED = true;

// Legal document checklist. If approvedKey = null => presence-only (e.g., GST).
const LEGAL_DOCS = [
  { key: "aadharFront",        approvedKey: "aadharFrontIsApproved",        label: "Aadhaar Front" },
  { key: "aadharBack",         approvedKey: "aadharBackIsApproved",         label: "Aadhaar Back" },
  { key: "panCard",            approvedKey: "panCardIsApproved",            label: "PAN Card" },
  { key: "companyPan",         approvedKey: "companyPanIsApproved",         label: "Company PAN" },
  { key: "gstNumber",          approvedKey: null,                            label: "GST Number" }, // presence only
  { key: "addressProof",       approvedKey: "addressProofIsApproved",       label: "Address Proof" },
  { key: "attachedImage",      approvedKey: "attachedImageIsApproved",      label: "Attached Image" },
];

// Admin assignment checklist from OfficeDetails
const ADMIN_ASSIGNMENTS = [
  { key: "officeBranchId",               label: "Office Branch" },
  { key: "leadSuccessCoordinatorId",     label: "Lead Success Coordinator" },
  { key: "partnerRelationshipExecutiveId", label: "Partner Relationship Executive" },
  { key: "salesOnboardingManagerId",     label: "Sales Onboarding Manager" },
];

/**
 * ==========================
 * HELPERS
 * ==========================
 */

const TITLE_MAP = {
  DOC_PENDING_APPROVAL: "Document pending approval",
  DOC_MISSING: "Document missing",
  DOC_APPROVED: "Document approved",

  TOKEN_PENDING_APPROVAL: "Token pending approval",
  TOKEN_APPROVED: "Token approved",
  PAYMENT_PROOF_MISSING: "Payment proof missing",

  SCHEDULED_PAYMENT_PENDING_APPROVAL: "Scheduled payment approval pending",
  SCHEDULED_PAYMENT_APPROVED: "Scheduled payment approved",

  BALANCE_DUE: "Balance due pending",
  BALANCE_CLEARED: "Balance cleared",

  ADMIN_ASSIGNMENT_PENDING: "Assignment pending",
  ADMIN_ASSIGNMENT_DONE: "Assignment completed",
};

function shortTitle(type) {
  return TITLE_MAP[type] || "Notification";
}

function severityFor(type) {
  switch (type) {
    case "BALANCE_DUE":
    case "PAYMENT_PROOF_MISSING":
      return "warning";

    case "TOKEN_PENDING_APPROVAL":
    case "SCHEDULED_PAYMENT_PENDING_APPROVAL":
      return "critical";

    case "DOC_PENDING_APPROVAL":
    case "DOC_MISSING":
    case "ADMIN_ASSIGNMENT_PENDING":
      return "warning";

    default:
      return "info";
  }
}

function buildItem({ role, type, message, entityId, investorName, phone, createdAt }) {
  return {
    id: uuidv4(),
    role,
    type,
    title: shortTitle(type),
    message,
    entityId,
    severity: severityFor(type),
    createdAt: createdAt || new Date().toISOString(),
    meta: { investorName, phone },
  };
}

function exists(val) {
  return val !== null && val !== undefined && String(val).trim() !== "";
}

/**
 * Given a BookingFormPersonalDetails row, generate all **legal** items.
 */
function generateLegalItems(pd, status) {
  const investorName = pd.fullName;
  const phone = pd.phoneNumber;
  const items = [];

  for (const d of LEGAL_DOCS) {
    const val = pd[d.key];
    const has = exists(val);
    const approved = d.approvedKey ? !!pd[d.approvedKey] : has;

    if (!has) {
      const item = buildItem({
        role: "legal",
        type: "DOC_MISSING",
        message: `${d.label} is missing for ${investorName}`,
        entityId: pd.id,
        investorName,
        phone,
        createdAt: pd.createdAt,
      });
      if (status === "all" || status === "pending") items.push(item);
    } else if (!approved) {
      const item = buildItem({
        role: "legal",
        type: "DOC_PENDING_APPROVAL",
        message: `${d.label} awaiting approval for ${investorName}`,
        entityId: pd.id,
        investorName,
        phone,
        createdAt: pd.updatedAt || pd.createdAt,
      });
      if (status === "all" || status === "pending") items.push(item);
    } else if (status === "all") {
      items.push(
        buildItem({
          role: "legal",
          type: "DOC_APPROVED",
          message: `${d.label} approved for ${investorName}`,
          entityId: pd.id,
          investorName,
          phone,
          createdAt: pd.updatedAt || pd.createdAt,
        })
      );
    }
  }

  return items;
}

/**
 * Given a BookingFormPersonalDetails row, generate all **finance** items.
 */
function generateFinanceItems(pd, status) {
  const investorName = pd.fullName;
  const phone = pd.phoneNumber;
  const p = pd.paymentDetails;
  const items = [];

  // Token checks
  if (p && p.tokenReceived !== null && p.tokenReceived !== undefined) {
    const tokenApproved = !!p.isTokenApproved;

    // Optional payment proof requirement for token (use paymentDetails.paymentProof)
    const tokenProofMissing =
      REQUIRE_PAYMENT_PROOF_FOR_TOKEN && !exists(p.paymentProof);

    if (!tokenApproved) {
      const it = buildItem({
        role: "finance",
        type: "TOKEN_PENDING_APPROVAL",
        message: `Token pending approval for ${investorName} (₹${p.tokenReceived ?? 0})`,
        entityId: pd.id,
        investorName,
        phone,
        createdAt: p.tokenDate || pd.createdAt,
      });
      if (status === "all" || status === "pending") items.push(it);
    } else if (status === "all") {
      items.push(
        buildItem({
          role: "finance",
          type: "TOKEN_APPROVED",
          message: `Token approved for ${investorName}`,
          entityId: pd.id,
          investorName,
          phone,
          createdAt: p.tokenDate || pd.updatedAt || pd.createdAt,
        })
      );
    }

    if (tokenProofMissing) {
      const it = buildItem({
        role: "finance",
        type: "PAYMENT_PROOF_MISSING",
        message: `Token payment proof missing for ${investorName}`,
        entityId: pd.id,
        investorName,
        phone,
        createdAt: p.tokenDate || pd.updatedAt || pd.createdAt,
      });
      if (status === "all" || status === "pending") items.push(it);
    }
  }

  // Balance due (if field used)
  if (p && typeof p.balanceDue === "number") {
    const due = p.balanceDue ?? 0;
    const it = buildItem({
      role: "finance",
      type: due > 0 ? "BALANCE_DUE" : "BALANCE_CLEARED",
      message: due > 0
        ? `Balance due ₹${due} for ${investorName}`
        : `Balance cleared for ${investorName}`,
      entityId: pd.id,
      investorName,
      phone,
      createdAt: pd.updatedAt || pd.createdAt,
    });
    if (status === "all" || (due > 0 && status === "pending")) items.push(it);
  }

  // Scheduled payments
  const sched = pd.paymentScheduledDetails || [];
  for (const s of sched) {
    const pendingApproval = s.isAmountApproved === false;
    const proofMissing =
      REQUIRE_PAYMENT_PROOF_FOR_SCHEDULED && !exists(s.paymentProof);

    if (pendingApproval) {
      const it = buildItem({
        role: "finance",
        type: "SCHEDULED_PAYMENT_PENDING_APPROVAL",
        message: `Scheduled payment ₹${s.amount ?? 0} on ${s.date ? new Date(s.date).toLocaleDateString() : "N/A"} pending approval for ${investorName}`,
        entityId: pd.id,
        investorName,
        phone,
        createdAt: s.date || pd.createdAt,
      });
      if (status === "all" || status === "pending") items.push(it);
    } else if (status === "all") {
      items.push(
        buildItem({
          role: "finance",
          type: "SCHEDULED_PAYMENT_APPROVED",
          message: `Scheduled payment approved for ${investorName}`,
          entityId: pd.id,
          investorName,
          phone,
          createdAt: s.date || pd.updatedAt || pd.createdAt,
        })
      );
    }

    if (proofMissing) {
      const it = buildItem({
        role: "finance",
        type: "PAYMENT_PROOF_MISSING",
        message: `Payment proof missing for scheduled payment (₹${s.amount ?? 0}) for ${investorName}`,
        entityId: pd.id,
        investorName,
        phone,
        createdAt: s.date || pd.updatedAt || pd.createdAt,
      });
      if (status === "all" || status === "pending") items.push(it);
    }
  }

  return items;
}

/**
 * Given a BookingFormPersonalDetails row, generate **admin** items:
 * = all legal pending + all finance pending + admin office assignments
 */
function generateAdminItems(pd, status) {
  const investorName = pd.fullName;
  const phone = pd.phoneNumber;
  const items = [];

  // Include all LEGAL **pending** items
  const legal = generateLegalItems(pd, "pending");
  items.push(...legal);

  // Include all FINANCE **pending** items
  const fin = generateFinanceItems(pd, "pending");
  items.push(...fin);

  // Plus admin office assignments
  const od = pd.officeDetails;
  for (const a of ADMIN_ASSIGNMENTS) {
    const ok = od && exists(od[a.key]);
    const it = buildItem({
      role: "admin",
      type: ok ? "ADMIN_ASSIGNMENT_DONE" : "ADMIN_ASSIGNMENT_PENDING",
      message: ok
        ? `${a.label} assigned for ${investorName}`
        : `${a.label} assignment pending for ${investorName}`,
      entityId: pd.id,
      investorName,
      phone,
      createdAt: pd.updatedAt || pd.createdAt,
    });
    if (status === "all" || (!ok && status === "pending")) items.push(it);
  }

  return items;
}

/**
 * ==========================
 * PUBLIC: SUMMARY
 * ==========================
 * pending/added/total counters reflect checks defined above.
 */
export async function getSummary(role) {
  if (!["legal", "finance", "admin"].includes(role)) {
    throw new Error("Invalid role");
  }

  console.log("askjdghfkjasdhfkajsdfkjsdhfkjasdhfkjsdh");
  
  const rows = await prisma.bookingFormPersonalDetails.findMany({
    orderBy: { createdAt: "desc" },
    take: 500, // tune as needed
    include: {
      paymentDetails: true,
      paymentScheduledDetails: true,
      officeDetails: true,
      user: true,
    },
  });

  let pending = 0;
  let added = 0;
  let total = 0;

  for (const pd of rows) {
    if (role === "legal") {
      for (const d of LEGAL_DOCS) {
        total++;
        const val = pd[d.key];
        const has = exists(val);
        const approved = d.approvedKey ? !!pd[d.approvedKey] : has;
        if (has) added++;
        if (!has || !approved) pending++;
      }
    }

    if (role === "finance") {
      const p = pd.paymentDetails;

      // token
      if (p && (p.tokenReceived !== null && p.tokenReceived !== undefined)) {
        total++;
        added++; // token exists => added
        if (!p.isTokenApproved) pending++;
        if (REQUIRE_PAYMENT_PROOF_FOR_TOKEN && !exists(p.paymentProof)) {
          // Count proof missing as additional pending condition:
          pending++;
          total++; // add a slot for proof requirement
        }
      }

      // balance
      if (p && typeof p.balanceDue === "number") {
        total++;
        if ((p.balanceDue ?? 0) > 0) pending++;
        else added++;
      }

      // scheduled
      const sched = pd.paymentScheduledDetails || [];
      for (const s of sched) {
        total++; // approval condition
        added++; // exists => added
        if (s.isAmountApproved === false) pending++;

        if (REQUIRE_PAYMENT_PROOF_FOR_SCHEDULED) {
          total++; // proof condition
          if (!exists(s.paymentProof)) pending++;
          else added++;
        }
      }
    }

    if (role === "admin") {
      // Count LEGAL pending checks
      const leg = generateLegalItems(pd, "pending");
      pending += leg.length;
      total += LEGAL_DOCS.length; // baseline legal checks
      // approximate "added" for legal: number of docs that exist
      for (const d of LEGAL_DOCS) {
        if (exists(pd[d.key])) added++;
      }

      // FINANCE pending checks
      const finPending = generateFinanceItems(pd, "pending");
      pending += finPending.length;

      // To keep total/added sensible for finance, count similar to finance branch:
      const p = pd.paymentDetails;
      if (p && (p.tokenReceived !== null && p.tokenReceived !== undefined)) {
        total++; added++; // token exists
        if (REQUIRE_PAYMENT_PROOF_FOR_TOKEN) { total++; if (exists(p.paymentProof)) added++; }
      }
      if (p && typeof p.balanceDue === "number") {
        total++; if ((p.balanceDue ?? 0) === 0) added++;
      }
      const sched = pd.paymentScheduledDetails || [];
      for (const s of sched) {
        total++; added++; // approval condition + exists
        if (REQUIRE_PAYMENT_PROOF_FOR_SCHEDULED) { total++; if (exists(s.paymentProof)) added++; }
      }

      // ADMIN office assignments
      const od = pd.officeDetails;
      for (const a of ADMIN_ASSIGNMENTS) {
        total++;
        const ok = od && exists(od[a.key]);
        if (ok) added++;
        if (!ok) pending++;
      }
    }
  }

  return { pending, added, total };
}

/**
 * ==========================
 * PUBLIC: LIST (paginated)
 * ==========================
 */
export async function getList({ role, status = "pending", limit = 20, cursor = null }) {
  if (!["legal", "finance", "admin"].includes(role)) {
    throw new Error("Invalid role");
  }

  const orderBy = { createdAt: "desc" };
  const take = limit;

  const pdList = await prisma.bookingFormPersonalDetails.findMany({
    orderBy,
    take: take + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    include: {
      paymentDetails: true,
      paymentScheduledDetails: true,
      officeDetails: true,
      user: true,
    },
  });

  let items = [];
  for (const pd of pdList.slice(0, limit)) {
    if (role === "legal") {
      items.push(...generateLegalItems(pd, status));
    } else if (role === "finance") {
      items.push(...generateFinanceItems(pd, status));
    } else if (role === "admin") {
      items.push(...generateAdminItems(pd, status));
    }
  }

  // Sort by createdAt desc across mixed items
  items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const hasMore = pdList.length > limit;
  const nextCursor = hasMore ? pdList[pdList.length - 1].id : null;

  return { items, hasMore, nextCursor };
}
