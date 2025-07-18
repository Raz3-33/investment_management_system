import { prisma } from "../config/db.js";  // Prisma setup

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
  return prisma.user.create({
    data: {
      ...data,
      // Add any additional fields like encrypted password here
    },
  });
};

export const updateUser = async (id, data) => {
  return prisma.user.update({
    where: { id },
    data,
  });
};

export const deleteUser = async (id) => {
  return prisma.user.delete({
    where: { id },
  });
};
