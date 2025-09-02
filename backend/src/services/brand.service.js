import { prisma } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

// Get all brands
export const getAllBrands = async () => {
  try {
    return await prisma.brand.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    throw new Error("Error fetching brands: " + error.message);
  }
};

// Get by ID
export const getBrandById = async (id) => {
  try {
    return await prisma.brand.findUnique({ where: { id } });
  } catch (error) {
    throw new Error("Error fetching brand: " + error.message);
  }
};

// Create
export const createBrand = async (brandData) => {
  const { name, description, isActive } = brandData;

  try {
    // Uniqueness checks (name)
    const existing = await prisma.brand.findFirst({
      where: { OR: [{ name }] },
    });
    if (existing) throw new Error("Brand with same name already exists");

    const newBrand = await prisma.brand.create({
      data: {
        id: uuidv4(),
        name,
        description: description ?? null,
        isActive: typeof isActive === "boolean" ? isActive : true,
      },
    });

    return newBrand;
  } catch (error) {
    throw new Error("Error creating brand: " + error.message);
  }
};

// Update
export const updateBrand = async (id, brandData) => {
  const { name, description, isActive } = brandData;

  try {
    const existing = await prisma.brand.findUnique({ where: { id } });
    if (!existing) throw new Error("Brand not found");

    // Optional: prevent duplicate name conflicts
    if (name) {
      const conflict = await prisma.brand.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            { OR: [{ name }] },
          ],
        },
      });
      if (conflict) throw new Error("Another brand with same name exists");
    }

    const updated = await prisma.brand.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive: !!isActive }),
      },
    });

    return updated;
  } catch (error) {
    throw new Error("Error updating brand: " + error.message);
  }
};

// Delete
export const deleteBrand = async (id) => {
  try {
    // If brand has foreign relations (e.g., products), enforce checks here
    await prisma.brand.delete({ where: { id } });
  } catch (error) {
    throw new Error("Error deleting brand: " + error.message);
  }
};
