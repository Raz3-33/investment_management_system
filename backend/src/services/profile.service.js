import bcrypt from "bcryptjs";
import { prisma } from "../config/db.js"; // Prisma setup

export const getUserById = async (id) => {
  if (!id) {
    throw new Error("User ID is required");
  }
  return prisma.user.findUnique({
    where: { id: id },
    include: {
      role: true,
      branch: true,
    },
  });
};

export const changeUserPassword = async (
  userId,
  currentPassword,
  newPassword
) => {
  if (!userId || !currentPassword || !newPassword) {
    throw new Error("User ID, current password, and new password are required");
  }

  // Find user by ID
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Compare current password with hashed password in DB
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new Error("Current password is incorrect");
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const hashedNewPassword = await bcrypt.hash(newPassword, salt);

  // Update password in DB
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedNewPassword },
  });

  return { message: "Password updated successfully" };
};
