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
    case LEVEL.ASSOCIATE:
      if (!ids.executiveId)
        throw new Error("Executive is required for Associate.");
      break;
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

// services

export const getAllUsers = async () => {
  console.log(
    "=============================alajdfl+============================"
  );

  return prisma.user.findMany({
    include: {
      role: true,
      branch: true,
    },
  });
};

export const getUserById = async (id) => {
  return prisma.user.findUnique({
    where: { id },
    include: {
      role: true,
      branch: true,
    },
  });
};
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

    // NEW hierarchy inputs from UI:
    userLevel = LEVEL.ASSOCIATE,
    administrateId,
    headId,
    managerId,
    executiveId,

    // Optional extras
    image_url,
    salesTarget,
    salesAchieved,
    incentive,
    isActive,
    isLogin,

    // legacy (ignored for logic but accepted):
    isAdmin,
    userType,
  } = data;

  // Map legacy userType -> level (if someone still sends it)
  let level = userLevel;
  if (userType === "head") level = LEVEL.HEAD;
  if (userType === "manager") level = LEVEL.MANAGER;

  // Basic uniqueness
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new Error("A user with this email already exists.");

  // Validate referenced records exist
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

  // Enforce nearest supervisor presence
  requireClosestSupervisor(level, {
    administrateId,
    headId,
    managerId,
    executiveId,
  });

  // Validate supervisors & levels (if provided)
  const [adminU, headU, managerU, execU] = await Promise.all([
    assertExists(administrateId, "Invalid administrateId."),
    assertExists(headId, "Invalid headId."),
    assertExists(managerId, "Invalid managerId."),
    assertExists(executiveId, "Invalid executiveId."),
  ]);
  if (adminU) ensureLevel(adminU, LEVEL.ADMINISTRATE, "Administrate");
  if (headU) ensureLevel(headU, LEVEL.HEAD, "Head");
  if (managerU) ensureLevel(managerU, LEVEL.MANAGER, "Manager");
  if (execU) ensureLevel(execU, LEVEL.EXECUTIVE, "Executive");

  const hashedPassword = await bcrypt.hash(password, 10);

  // Derive legacy flags from level (for backward compatibility)
  const legacyFlags = {
    isAdmin: level === LEVEL.ADMINISTRATE,
    isHead: level === LEVEL.HEAD,
    isManager: level === LEVEL.MANAGER,
  };

  // Build data object with nested connects (NO raw roleId/branchId here)
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
  };

  if (image_url) dataToCreate.image_url = image_url;
  if (roleId) dataToCreate.role = { connect: { id: roleId } };
  if (branchId) dataToCreate.branch = { connect: { id: branchId } };

  // Self-relations (only add if your schema/migration includes them)
  if (administrateId)
    dataToCreate.administrate = { connect: { id: administrateId } };
  if (headId) dataToCreate.head = { connect: { id: headId } };
  if (managerId) dataToCreate.manager = { connect: { id: managerId } };
  if (executiveId) dataToCreate.executive = { connect: { id: executiveId } };

  try {
    const newUser = await prisma.user.create({ data: dataToCreate });
    return newUser;
  } catch (error) {
    throw new Error("Error creating user: " + error.message);
  }
};

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

    // hierarchy
    userLevel,
    administrateId,
    headId,
    managerId,
    executiveId,

    // legacy
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

  if (level) {
    requireClosestSupervisor(level, {
      administrateId,
      headId,
      managerId,
      executiveId,
    });

    const [adminU, headU, managerU, execU] = await Promise.all([
      assertExists(administrateId, "Invalid administrateId."),
      assertExists(headId, "Invalid headId."),
      assertExists(managerId, "Invalid managerId."),
      assertExists(executiveId, "Invalid executiveId."),
    ]);
    if (adminU) ensureLevel(adminU, LEVEL.ADMINISTRATE, "Administrate");
    if (headU) ensureLevel(headU, LEVEL.HEAD, "Head");
    if (managerU) ensureLevel(managerU, LEVEL.MANAGER, "Manager");
    if (execU) ensureLevel(execU, LEVEL.EXECUTIVE, "Executive");
  }

  const dataToUpdate = {
    name,
    email,
    countryCode,
    phone,
    designation,
    // relations via connect
    role: { connect: { id: roleId } },
    branch: { connect: { id: branchId } },
  };

  if (level) {
    dataToUpdate.userLevel = level;
    dataToUpdate.isAdmin = level === LEVEL.ADMINISTRATE;
    dataToUpdate.isHead = level === LEVEL.HEAD;
    dataToUpdate.isManager = level === LEVEL.MANAGER;
  }

  // Supervisor connects (only connect when an id is supplied)
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
  if (executiveId !== undefined) {
    dataToUpdate.executive = executiveId
      ? { connect: { id: executiveId } }
      : { disconnect: true };
  }

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
    throw new Error(`Failed to update user: ${error.message}`);
  }
};

export const deleteUser = async (id) => {
  return prisma.user.delete({
    where: { id },
  });
};
