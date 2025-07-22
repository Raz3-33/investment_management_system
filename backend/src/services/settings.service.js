import { prisma } from "../config/db.js"; // Prisma setup


//{{investmentType}}

export const getAllInvestmentTypes = async () => {
  return prisma.investmentType.findMany();
};

export const getInvestmentTypeById = async (id) => {
  return prisma.investmentType.findUnique({
    where: { id },
  });
};

export const createInvestmentType = async (data) => {
  const { name, description } = data;

  // Validate that the name is unique
  const existingType = await prisma.investmentType.findUnique({
    where: { name },
  });

  if (existingType) {
    throw new Error("An investment type with this name already exists.");
  }

  try {
    const newType = await prisma.investmentType.create({
      data: { name, description },
    });

    return newType;
  } catch (error) {
    throw new Error("Error creating investment type: " + error.message);
  }
};

export const updateInvestmentType = async (id, data) => {
  try {
    // Check if the name is unique (if updated)
    if (data.name) {
      const existingType = await prisma.investmentType.findUnique({
        where: { name: data.name },
      });

      if (existingType && existingType.id !== id) {
        throw new Error("An investment type with this name already exists.");
      }
    }

    // Update the investment type
    const updatedType = await prisma.investmentType.update({
      where: { id },
      data,
    });

    return updatedType;
  } catch (error) {
    throw new Error("Error updating investment type: " + error.message);
  }
};

export const deleteInvestmentType = async (id) => {
  try {
    await prisma.investmentType.delete({
      where: { id },
    });
  } catch (error) {
    throw new Error("Error deleting investment type: " + error.message);
  }
};

//{{businessCategory}}

export const getAllBusinessCategories = async () => {
  return prisma.businessCategory.findMany();
};

export const getBusinessCategoryById = async (id) => {
  return prisma.businessCategory.findUnique({
    where: { id },
  });
};

export const createBusinessCategory = async (data) => {
  const { name, description } = data;

  // Validate that the name is unique
  const existingCategory = await prisma.businessCategory.findUnique({
    where: { name },
  });

  if (existingCategory) {
    throw new Error("A business category with this name already exists.");
  }

  try {
    const newCategory = await prisma.businessCategory.create({
      data: { name, description },
    });

    return newCategory;
  } catch (error) {
    throw new Error("Error creating business category: " + error.message);
  }
};

export const updateBusinessCategory = async (id, data) => {
  try {
    // Check if the name is unique (if updated)
    if (data.name) {
      const existingCategory = await prisma.businessCategory.findUnique({
        where: { name: data.name },
      });

      if (existingCategory && existingCategory.id !== id) {
        throw new Error("A business category with this name already exists.");
      }
    }

    // Update the business category
    const updatedCategory = await prisma.businessCategory.update({
      where: { id },
      data,
    });

    return updatedCategory;
  } catch (error) {
    throw new Error("Error updating business category: " + error.message);
  }
};

export const deleteBusinessCategory = async (id) => {
  try {
    await prisma.businessCategory.delete({
      where: { id },
    });
  } catch (error) {
    throw new Error("Error deleting business category: " + error.message);
  }
};
