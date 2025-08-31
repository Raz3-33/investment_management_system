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

// Light validator specifically for UPDATE (single record)
// validate only what we actually use/update
const validateUpdate = (data) => {
  if (data.assignmentType) {
    const t = String(data.assignmentType).toUpperCase();
    if (!["MANUALLY", "AUTOMATICALLY", "USER"].includes(t)) {
      throw new Error("Invalid assignmentType");
    }
  }

  const t = data.assignmentType
    ? String(data.assignmentType).toUpperCase()
    : undefined;

  if (t === "MANUALLY") {
    if (!data.locationName || !String(data.locationName).trim()) {
      throw new Error("locationName is required for MANUALLY");
    }
  }

  if (t === "AUTOMATICALLY") {
    if (!data.pincode || String(data.pincode).length !== 6) {
      throw new Error("Valid 6-digit pincode is required for AUTOMATICALLY");
    }
    if (!data.city || !String(data.city).trim()) {
      throw new Error("city is required for AUTOMATICALLY");
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
    const existing = await prisma.territory.findUnique({ where: { id } });
    if (!existing) throw new Error("Territory not found");

    // normalize FE values like "Manually" → "MANUALLY"
    const normalizedType = data.assignmentType
      ? String(data.assignmentType).toUpperCase()
      : undefined;

    validateUpdate({ ...data, assignmentType: normalizedType });

    const patch = {};

    // Only set fields that exist in the schema
    // opportunity switch (optional)
    if (data.opportunityId) {
      patch.investmentOpportunityId = String(data.opportunityId);
    }

    // assignment type switch (or reconfirm)
    if (normalizedType) {
      patch.assignmentType = normalizedType;

      if (normalizedType === "MANUALLY") {
        patch.location = String(data.locationName || "").trim();
        patch.pincode = null;
        patch.city = null;
      } else if (normalizedType === "AUTOMATICALLY") {
        patch.location = null;
        patch.pincode = String(data.pincode);
        patch.city = data.city ? String(data.city).trim() : null;
      } else if (normalizedType === "USER") {
        patch.location = null;
        patch.pincode = null;
        patch.city = null;
      }
    } else {
      // No type provided: allow partial edits consistent with existing type
      if (existing.assignmentType === "MANUALLY" && data.locationName) {
        patch.location = String(data.locationName).trim();
      }
      if (existing.assignmentType === "AUTOMATICALLY") {
        if (data.pincode) patch.pincode = String(data.pincode);
        if (data.city != null) patch.city = String(data.city).trim();
      }
      // USER: nothing to change here, unless opportunity/image changes
    }

    // image handling decided in controller -> nextImageUrl:
    // undefined => keep existing; string => set; null => clear
    if (data.nextImageUrl !== undefined) {
      patch.imageUrl = data.nextImageUrl;
    }

    const updated = await prisma.territory.update({
      where: { id },
      data: patch,
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
