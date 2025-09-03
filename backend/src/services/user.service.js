import bcrypt from "bcryptjs"; // Import bcryptjs to hash the password
import { prisma } from "../config/db.js"; // Prisma setup

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
    managerId,
    headId,
    countryCode,
    phone,
    userType,
    image_url,
    salesTarget,
    salesAchieved,
    incentive,
    isActive,
    isLogin,
    isAdmin,
  } = data;

  // Validate roleId exists
  if (roleId) {
    const roleExists = await prisma.role.findUnique({ where: { id: roleId } });
    if (!roleExists) {
      throw new Error("Invalid roleId. The specified role does not exist.");
    }
  }

  // Validate branchId exists
  if (branchId) {
    const branchExists = await prisma.branch.findUnique({
      where: { id: branchId },
    });
    if (!branchExists) {
      throw new Error("Invalid branchId. The specified branch does not exist.");
    }
  }

  // Validate managerId exists (if provided)
  if (managerId) {
    const managerExists = await prisma.user.findUnique({
      where: { id: managerId },
    });
    if (!managerExists) {
      throw new Error(
        "Invalid managerId. The specified manager does not exist."
      );
    }
  }

  // Validate headId exists (if provided)
  if (headId) {
    const headExists = await prisma.user.findUnique({ where: { id: headId } });
    if (!headExists) {
      throw new Error("Invalid headId. The specified head does not exist.");
    }
  }

  // Validate that email is unique
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("A user with this email already exists.");
  }

  //  Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const cleanId = (value) => (value && value.trim() !== "" ? value : null);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId,
        designation,
        branchId,
        managerId: cleanId(managerId),
        headId: cleanId(headId),
        countryCode,
        phone,
        isHead: userType === "head" ? true : false,
        isManager: userType === "manager" ? true : false,
        image_url,
        salesTarget: salesTarget ?? 0,
        salesAchieved: salesAchieved ?? 0,
        incentive: incentive ?? 0,
        isActive: isActive ?? true,
        isLogin: isLogin ?? false,
        isAdmin: isAdmin ?? false,
      },
    });

    return newUser;
  } catch (error) {
    throw new Error("Error creating user: " + error.message);
  }
};

export const updateUser = async (id, data) => {
  try {
    const {
      name,
      email,
      countryCode,
      phone,
      roleId,
      designation,
      branchId,
      headId,
      managerId,
      userType,
      password,
    } = data;

    // Validate required fields
    if (!name || !email || !roleId || !branchId) {
      throw new Error(
        "All required fields (name, email, roleId, branchId) must be provided."
      );
    }

    // Check role existence
    const roleExists = await prisma.role.findUnique({ where: { id: roleId } });
    if (!roleExists) {
      throw new Error("Invalid roleId. The specified role does not exist.");
    }

    // Check email uniqueness (ignore the current user)
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        NOT: { id },
      },
      select: { id: true },
    });
    if (existingUser) {
      throw new Error("A user with this email already exists.");
    }

    // Build update payload, only including password if provided
    const updatePayload = {
      name,
      email,
      countryCode,
      phone,
      roleId,
      designation,
      branchId,
      headId: headId || null,
      managerId: managerId || null,
      isHead: userType === "head",
      isManager: userType === "manager",
    };

    // If password provided, hash and include it
    if (password && password.trim().length > 0) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updatePayload.password = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updatePayload,
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
