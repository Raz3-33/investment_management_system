import { prisma } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

// Optional: centralize simple validation
const validate = (data) => {
  if (!data.opportunityId) throw new Error("opportunityId is required");
  if (!data.assignmentType) throw new Error("assignmentType is required");

  if (data.assignmentType.toUpperCase() === "MANUALLY") {
    if (!data.locations || data.locations.length === 0) {
      throw new Error(
        "At least one location is required for MANUALLY assignment"
      );
    }
  }

  if (data.assignmentType.toUpperCase() === "AUTOMATICALLY") {
    if (!data.pincodes || data.pincodes.length === 0) {
      throw new Error(
        "At least one pincode is required for AUTOMATICALLY assignment"
      );
    }
  }
};

export const getAll = async () => {
  try {
    return await prisma.territory.findMany({
      orderBy: {
        createdAt: "desc",
      },
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

    const { opportunityId, assignmentType } = data;
    const type = assignmentType.toUpperCase();

    let createdRecords = [];

    if (type === "MANUALLY") {
      for (const loc of data.locations) {
        const created = await prisma.territory.create({
          data: {
            id: uuidv4(),
            investmentOpportunityId: opportunityId,
            assignmentType: type,
            location: loc.name.trim(),
            pincode: null,
            city: null,
            imageUrl: loc.imageUrl || null,
          },
        });
        createdRecords.push(created);
      }
    }

    if (type === "AUTOMATICALLY") {
      if (!Array.isArray(data.pincodes) || data.pincodes.length === 0) {
        throw new Error(
          "At least one pincode is required for AUTOMATICALLY assignment type"
        );
      }

      for (const pin of data.pincodes) {
        const created = await prisma.territory.create({
          data: {
            id: uuidv4(),
            investmentOpportunityId: opportunityId,
            assignmentType: type,
            location: null,
            pincode: pin.code,
            city: pin.city || null,
            imageUrl: pin.imageUrl || null,
          },
        });
        createdRecords.push(created);
      }
    }

    if (type === "USER") {
      const created = await prisma.territory.create({
        data: {
          id: uuidv4(),
          investmentOpportunityId: opportunityId,
          assignmentType: type,
          location: null,
          pincode: null,
          city: null,
          imageUrl: null,
        },
      });
      createdRecords.push(created);
    }

    return createdRecords;
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
