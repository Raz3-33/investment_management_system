import bcrypt from "bcryptjs"; // Import bcryptjs to hash the password
import { prisma } from "../config/db.js"; // Prisma setup

// helper

const LEVEL = {
  ADMINISTRATE: "ADMINISTRATE",
  HEAD: "HEAD",
  MANAGER: "MANAGER",
  EXECUTIVE: "EXECUTIVE",
  ASSOCIATE: "ASSOCIATE",
};

const assertExists = async (id, message = "Invalid id") => {
  if (!id) return null;
  const u = await prisma.user.findUnique({ where: { id } });
  if (!u) throw new Error(message);
  return u;
};

const requireClosestSupervisor = (userLevel, ids) => {
  switch (userLevel) {
    case LEVEL.ASSOCIATE: {
      const hasExecArray =
        Array.isArray(ids.executiveIds) && ids.executiveIds.length > 0;
      const hasLegacySingle = !!ids.executiveId;
      if (!hasExecArray && !hasLegacySingle) {
        throw new Error("Executive is required for Associate.");
      }
      break;
    }
    case LEVEL.EXECUTIVE:
      if (!ids.managerId) throw new Error("Manager is required for Executive.");
      break;
    case LEVEL.MANAGER:
      if (!ids.headId) throw new Error("Head is required for Manager.");
      break;
    case LEVEL.HEAD:
      if (!ids.administrateId)
        throw new Error("Administrate is required for Head.");
      break;
    case LEVEL.ADMINISTRATE:
    default:
      break;
  }
};

const ensureLevel = (user, expectedLevel, label) => {
  if (!user) return;
  if (user.userLevel !== expectedLevel) {
    throw new Error(`${label} must be a ${expectedLevel} user.`);
  }
};

// user find helper
// Small typed errors for cleaner controller codes
const unauthorized = (msg = "Unauthorized") =>
  Object.assign(new Error(msg), { code: "UNAUTHORIZED" });
const forbidden = (msg = "Forbidden") =>
  Object.assign(new Error(msg), { code: "FORBIDDEN" });
const notFound = (msg = "Not found") =>
  Object.assign(new Error(msg), { code: "NOT_FOUND" });

// Pull the minimal fields we need to decide scope
async function getViewer(viewerId) {
  if (!viewerId) throw unauthorized();
  const viewer = await prisma.user.findUnique({
    where: { id: viewerId },
    select: { id: true, isAdmin: true, userLevel: true },
  });
  if (!viewer) throw unauthorized("Viewer not found");
  return viewer;
}

const assertAllExistAtLevel = async (ids, expectedLevel, label) => {
  if (!ids || !ids.length) return [];
  const found = await prisma.user.findMany({
    where: { id: { in: ids } },
    select: { id: true, userLevel: true },
  });
  if (found.length !== ids.length) throw new Error(`Some ${label} not found.`);
  found.forEach((u) => {
    if (u.userLevel !== expectedLevel) {
      throw new Error(`${label} must be ${expectedLevel} users.`);
    }
  });
  return found.map((u) => u.id);
};

// services

/**
 * List users visible to the viewer.
 * - Admins: all users
 * - Others: users directly reporting to viewer via any supervisor column
 */
export async function getAllUsers(viewerId, { includeSelf = false } = {}) {
  const viewer = await getViewer(viewerId);

  if (viewer.isAdmin) {
    return prisma.user.findMany({
      include: { role: true, branch: true },
      orderBy: { createdAt: "desc" },
    });
  }

  // Direct reports only (no recursion)
  const where = {
    OR: [
      { administrateId: viewer.id },
      { headId: viewer.id },
      { managerId: viewer.id },
      { executiveId: viewer.id },
    ],
  };

  if (includeSelf) {
    where.OR.push({ id: viewer.id });
  }

  return prisma.user.findMany({
    where,
    include: { role: true, branch: true },
    orderBy: { createdAt: "desc" },
  });
}

export const getUserById = async (id) => {
  return prisma.user.findUnique({
    where: { id },
    include: {
      role: true,
      branch: true,
    },
  });
};


// =======================
export const createUser = async (data) => {
  const {
    name,
    email,
    password,
    roleId,
    designation,
    branchId,
    countryCode,
    phone,

    // hierarchy
    userLevel = LEVEL.ASSOCIATE,
    administrateId,
    headId,
    managerId,

    // multi-exec (new) + legacy single accepted but not written directly
    executiveIds,
    executiveId,

    // extras
    image_url,
    salesTarget,
    salesAchieved,
    incentive,
    isActive,
    isLogin,

    // legacy flags (ignored for logic)
    isAdmin,
    userType,
  } = data;

  // Map legacy userType -> level
  let level = userLevel;
  if (userType === "head") level = LEVEL.HEAD;
  if (userType === "manager") level = LEVEL.MANAGER;

  // Merge & dedupe execs (accept legacy single from callers that still send it)
  const finalExecutiveIds = Array.from(
    new Set(
      [
        ...(Array.isArray(executiveIds) ? executiveIds : []),
        ...(executiveId ? [executiveId] : []),
      ].filter(Boolean)
    )
  );

  // Uniqueness
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new Error("A user with this email already exists.");

  // Foreigns exist
  if (roleId) {
    const roleExists = await prisma.role.findUnique({ where: { id: roleId } });
    if (!roleExists) throw new Error("Invalid roleId.");
  }
  if (branchId) {
    const branchExists = await prisma.branch.findUnique({
      where: { id: branchId },
    });
    if (!branchExists) throw new Error("Invalid branchId.");
  }

  // Nearest supervisor presence (supports array)
  requireClosestSupervisor(level, {
    administrateId,
    headId,
    managerId,
    executiveId, // legacy
    executiveIds: finalExecutiveIds,
  });

  // Extra human-friendly checks
  if (level === LEVEL.EXECUTIVE && !managerId)
    throw new Error("Manager is required for Executive.");
  if (level === LEVEL.MANAGER && !headId)
    throw new Error("Head is required for Manager.");
  if (level === LEVEL.HEAD && !administrateId)
    throw new Error("Administrate is required for Head.");
  if (level === LEVEL.ASSOCIATE && finalExecutiveIds.length === 0) {
    throw new Error("At least one Executive is required for an Associate.");
  }

  // Validate levels
  const [adminU, headU, managerU] = await Promise.all([
    assertExists(administrateId, "Invalid administrateId."),
    assertExists(headId, "Invalid headId."),
    assertExists(managerId, "Invalid managerId."),
  ]);
  if (adminU) ensureLevel(adminU, LEVEL.ADMINISTRATE, "Administrate");
  if (headU) ensureLevel(headU, LEVEL.HEAD, "Head");
  if (managerU) ensureLevel(managerU, LEVEL.MANAGER, "Manager");
  if (finalExecutiveIds.length) {
    await assertAllExistAtLevel(
      finalExecutiveIds,
      LEVEL.EXECUTIVE,
      "Executives"
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const legacyFlags = {
    isAdmin: level === LEVEL.ADMINISTRATE,
    isHead: level === LEVEL.HEAD,
    isManager: level === LEVEL.MANAGER,
  };

  const dataToCreate = {
    name,
    email,
    password: hashedPassword,
    designation,
    countryCode,
    phone,
    userLevel: level,

    salesTarget: salesTarget ?? 0,
    salesAchieved: salesAchieved ?? 0,
    incentive: incentive ?? 0,
    isActive: isActive ?? true,
    isLogin: isLogin ?? false,
    ...legacyFlags,

    ...(image_url ? { image_url } : {}),

    ...(roleId ? { role: { connect: { id: roleId } } } : {}),
    ...(branchId ? { branch: { connect: { id: branchId } } } : {}),

    ...(administrateId
      ? { administrate: { connect: { id: administrateId } } }
      : {}),
    ...(headId ? { head: { connect: { id: headId } } } : {}),
    ...(managerId ? { manager: { connect: { id: managerId } } } : {}),

    // multi-exec via pivot
    ...(level === LEVEL.ASSOCIATE && finalExecutiveIds.length
      ? {
          myExecutives: {
            create: finalExecutiveIds.map((eid) => ({
              // IMPORTANT: connect the related executive; Prisma will set associateId automatically
              executive: { connect: { id: eid } },
            })),
          },
        }
      : {}),
  };

  // IMPORTANT: DO NOT write the legacy single `executive` relation (your schema doesn’t have it anymore)
  // if (executiveId) dataToCreate.executive = { connect: { id: executiveId } }; // ❌ remove

  try {
    const newUser = await prisma.user.create({ data: dataToCreate });
    return newUser;
  } catch (error) {
    throw new Error("Error creating user: " + error.message);
  }
};

// =======================
export const updateUser = async (id, data) => {
  const {
    name,
    email,
    countryCode,
    phone,
    roleId,
    designation,
    branchId,
    password,

    userLevel,
    administrateId,
    headId,
    managerId,

    // multi-exec (new) + legacy single accepted but not written directly
    executiveIds,
    executiveId,

    userType,
  } = data;

  if (!name || !email || !roleId || !branchId) {
    throw new Error(
      "All required fields (name, email, roleId, branchId) must be provided."
    );
  }

  const roleExists = await prisma.role.findUnique({ where: { id: roleId } });
  if (!roleExists) throw new Error("Invalid roleId.");

  const duplicate = await prisma.user.findFirst({
    where: { email, NOT: { id } },
    select: { id: true },
  });
  if (duplicate) throw new Error("A user with this email already exists.");

  let level = userLevel;
  if (!level && userType) {
    if (userType === "head") level = LEVEL.HEAD;
    if (userType === "manager") level = LEVEL.MANAGER;
  }

  const finalExecutiveIds = Array.from(
    new Set(
      [
        ...(Array.isArray(executiveIds) ? executiveIds : []),
        ...(executiveId ? [executiveId] : []),
      ].filter(Boolean)
    )
  );

  const current = await prisma.user.findUnique({
    where: { id },
    select: { userLevel: true },
  });
  const targetLevel = level ?? current?.userLevel ?? LEVEL.ASSOCIATE;

  // Validate supervisor presence when changing to a level that needs one
  if (targetLevel === LEVEL.EXECUTIVE && managerId === "") {
    throw new Error("Manager is required for Executive.");
  }
  if (targetLevel === LEVEL.MANAGER && headId === "") {
    throw new Error("Head is required for Manager.");
  }
  if (targetLevel === LEVEL.HEAD && administrateId === "") {
    throw new Error("Administrate is required for Head.");
  }

  if (administrateId) {
    const u = await assertExists(administrateId, "Invalid administrateId.");
    ensureLevel(u, LEVEL.ADMINISTRATE, "Administrate");
  }
  if (headId) {
    const u = await assertExists(headId, "Invalid headId.");
    ensureLevel(u, LEVEL.HEAD, "Head");
  }
  if (managerId) {
    const u = await assertExists(managerId, "Invalid managerId.");
    ensureLevel(u, LEVEL.MANAGER, "Manager");
  }
  if (finalExecutiveIds.length) {
    await assertAllExistAtLevel(
      finalExecutiveIds,
      LEVEL.EXECUTIVE,
      "Executives"
    );
  }

  const dataToUpdate = {
    name,
    email,
    countryCode,
    phone,
    designation,
    role: { connect: { id: roleId } },
    branch: { connect: { id: branchId } },
  };

  if (level) {
    dataToUpdate.userLevel = level;
    dataToUpdate.isAdmin = level === LEVEL.ADMINISTRATE;
    dataToUpdate.isHead = level === LEVEL.HEAD;
    dataToUpdate.isManager = level === LEVEL.MANAGER;
  }

  if (administrateId !== undefined) {
    dataToUpdate.administrate = administrateId
      ? { connect: { id: administrateId } }
      : { disconnect: true };
  }
  if (headId !== undefined) {
    dataToUpdate.head = headId
      ? { connect: { id: headId } }
      : { disconnect: true };
  }
  if (managerId !== undefined) {
    dataToUpdate.manager = managerId
      ? { connect: { id: managerId } }
      : { disconnect: true };
  }

  // Replace-all semantics for executives if an array is supplied
  if (Array.isArray(executiveIds)) {
    dataToUpdate.myExecutives = {
      deleteMany: {}, // remove existing assignments
      create: executiveIds.map((eid) => ({
        executive: { connect: { id: eid } },
      })),
    };
  }
  // Do NOT write legacy single here either

  if (password && password.trim()) {
    dataToUpdate.password = await bcrypt.hash(password, 10);
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });
    return updatedUser;
  } catch (error) {
    console.log(error,"errorerrorerrorerrorerrorerror");
    
    throw new Error(`Failed to update user: ${error.message}`);
  }
};

export const deleteUser = async (id) => {
  return prisma.user.delete({
    where: { id },
  });
};
