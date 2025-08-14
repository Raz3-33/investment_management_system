import { prisma } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

// Optional: centralize simple validation
const validate = ({ name, region }) => {
  const errors = [];
  if (!name || !name.trim()) errors.push("Name is required");
  if (name && name.trim().length < 3) errors.push("Name must be at least 3 characters");
  if (!region || !region.trim()) errors.push("Region is required");
  if (errors.length) throw new Error(`Validation failed: ${errors.join(", ")}`);
};

export const getAll = async () => {
  try {
    return await prisma.territory.findMany({
      orderBy: { name: "asc" },
    });
  } catch (error) {
    throw new Error("Error fetching territories: " + error.message);
  }
};

export const getById = async (id) => {
  try {
    return await prisma.territory.findUnique({ where: { id } });
  } catch (error) {
    throw new Error("Error fetching territory: " + error.message);
  }
};

export const create = async (data) => {
  try {
    validate(data);
    const name = data.name.trim();
    const region = data.region.trim();

    const existing = await prisma.territory.findFirst({ where: { name } });
    if (existing) throw new Error("Territory with the same name already exists");

    const created = await prisma.territory.create({
      data: { id: uuidv4(), name, region },
    });
    return created;
  } catch (error) {
    throw new Error("Error creating territory: " + error.message);
  }
};

export const update = async (id, data) => {
  try {
    validate(data);
    const existing = await prisma.territory.findUnique({ where: { id } });
    if (!existing) throw new Error("Territory not found");

    // If name is changed, ensure uniqueness
    if (data.name && data.name.trim() !== existing.name) {
      const dup = await prisma.territory.findFirst({
        where: { name: data.name.trim() },
      });
      if (dup) throw new Error("Territory with the same name already exists");
    }

    const updated = await prisma.territory.update({
      where: { id },
      data: {
        name: data.name.trim(),
        region: data.region.trim(),
      },
    });
    return updated;
  } catch (error) {
    throw new Error("Error updating territory: " + error.message);
  }
};

export const remove = async (id) => {
  try {
    // Optional: block delete if associated entities exist (example shows branches)
    // const territory = await prisma.territory.findUnique({
    //   where: { id },
    //   include: { branches: true }, // adjust relation if you have one
    // });
    // if (territory?.branches?.length) {
    //   throw new Error("Cannot delete territory as it has assigned branches.");
    // }

    await prisma.territory.delete({ where: { id } });
  } catch (error) {
    throw new Error("Error deleting territory: " + error.message);
  }
};
