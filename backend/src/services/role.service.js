import { v4 as uuidv4 } from "uuid";
import { prisma } from "../config/db.js";

export const getAllRoles = async () => {
  return prisma.role.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
  });
};

export const getRoleWithPermissions = async (roleId) => {
  return prisma.role.findUnique({
    where: { id: roleId },
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
  });
};

export const createRole = async (data) => {
  const { name, description, permissions } = data;

  // 1. Create the Role
  const role = await prisma.role.create({
    data: {
      name,
      description,
    },
  });

  // 2. Insert permissions and collect their UUIDs
  const createdPermissions = await Promise.all(
    permissions.map(async (p) => {
      // Check if the permission already exists (based on name)
      const name = `${p.label}:${p.access}`;
      const existing = await prisma.permission.findFirst({
        where: { name },
      });

      if (existing) return existing;

      // Else create new with UUID
      return prisma.permission.create({
        data: {
          id: uuidv4(), // UUID as per your schema
          name,
          description: "", // Add if needed
        },
      });
    })
  );

  // 3. Create RolePermission records with actual UUIDs
  const rolePermissions = await Promise.all(
    createdPermissions.map((perm, index) =>
      prisma.rolePermission.create({
        data: {
          roleId: role.id,
          permissionId: perm.id,
          access: permissions[index].access, // preserve access
        },
      })
    )
  );

  return { role, permissions: rolePermissions };
};

export const updateRole = (id, data) => {
  return prisma.role.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      permissions: {
        set: data.permissionIds?.map((id) => ({ id })),
      },
    },
  });
};

export const deleteRole = (id) => {
  return prisma.role.delete({ where: { id } });
};
