import bcrypt from "bcryptjs"; // Import bcryptjs to hash the password
import { prisma } from "../config/db.js"; // Prisma setup

export const getAllUsers = async () => {
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
  const { name, email, password, roleId, branchId } = data;

  // Validate roleId exists in the database
  const roleExists = await prisma.role.findUnique({
    where: { id: roleId },
  });

  if (!roleExists) {
    throw new Error("Invalid roleId. The specified role does not exist.");
  }

  // Validate that email is unique
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("A user with this email already exists.");
  }

  // Hash the password before storing it
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword, // Use hashed password
        roleId,
        branchId,
      },
    });

    return newUser;
  } catch (error) {
    throw new Error("Error creating user: " + error.message);
  }
};

export const updateUser = async (id, data) => {
  try {
    // Validate required fields
    if (!data.name || !data.email || !data.roleId || !data.branchId) {
      throw new Error("All fields (name, email, role, and branch) are required.");
    }

    // Check if the email is unique (if updated)
    if (data.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      // If an existing user with this email is found, check if it's the same user being updated
      if (existingUser && existingUser.id !== id) {
        throw new Error("A user with this email already exists.");
      }
    }

    // If password is being updated, hash the password
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10); // Hash the new password
    }

    // Perform the update in the database
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...data, // Spread the other fields
      },
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
