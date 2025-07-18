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


  console.log(data,"================");
  console.log(permissions,"permissionspermissionspermissionspermissionspermissions");

  
  // 1. Check if the role already exists
  const existingRole = await prisma.role.findUnique({
    where: { name },
  });

  if (existingRole) {
    throw new Error(`Role with the name "${name}" already exists.`);
  }

  // 2. Create the Role
  const role = await prisma.role.create({
    data: {
      name,
      description,
    },
  });

  // 3. Insert permissions and collect their UUIDs
  const createdPermissions = await Promise.all(
    permissions.map(async (permissionString) => {
      // Split the permission string into label and access
      const [label, access] = permissionString.split(":");

      const permissionName = `${label}:${access}`;
      // Check if the permission already exists
      const existingPermission = await prisma.permission.findFirst({
        where: { name: permissionName },
      });

      console.log(permissionName, "permissionName");

      // If permission exists, return it, else create a new one
      if (existingPermission) {
        return existingPermission; // Use existing permission
      } else {
        return await prisma.permission.create({
          data: {
            id: uuidv4(), // Create a new permission ID
            name: permissionName,
            description: "", // Optional description
          },
        });
      }
    })
  );

  // 4. Create RolePermission records with actual UUIDs
  const rolePermissions = await Promise.all(
    createdPermissions.map((perm, index) =>
      prisma.rolePermission.create({
        data: {
          roleId: role.id,
          permissionId: perm.id,
          access: permissions[index].split(":")[1], // Preserve access level from the form
        }
      })
    )
  );

  return { role, permissions: rolePermissions };
};


export const updateRole = async (id, data) => {
  const { name, description, permissions } = data;

  console.log(data, "datadatadatadatadatadata");

  // 1. Update the Role details
  const updatedRole = await prisma.role.update({
    where: { id },
    data: {
      name,
      description,
    },
  });

  // 2. Find the existing permissions
  const existingPermissions = await prisma.permission.findMany({
    where: {
      name: {
        in: permissions, // Permissions from the frontend
      },
    },
  });

  // 3. Create any new permissions that don't exist
  const newPermissions = await Promise.all(
    permissions
      .filter((perm) => !existingPermissions.find((ep) => ep.name === perm)) // Only filter out the existing ones
      .map(async (perm) => {
        const newPermission = await prisma.permission.create({
          data: {
            id: uuidv4(), // New permission ID
            name: perm,
            description: "", // Optional description
          },
        });
        return newPermission;
      })
  );

  // Combine the existing permissions with the new ones
  const allPermissions = [...existingPermissions, ...newPermissions];

  // 4. Remove all the existing rolePermission associations
  // We will now only update the associations based on the permissions provided
  await prisma.rolePermission.deleteMany({
    where: { roleId: id },
  });

  // 5. Create new RolePermission records for the provided permissions
  const rolePermissions = await Promise.all(
    allPermissions.map((perm) =>
      prisma.rolePermission.create({
        data: {
          roleId: updatedRole.id,
          permissionId: perm.id,
          access: "view", // You can customize the access level as needed
        },
      })
    )
  );

  return { role: updatedRole, permissions: rolePermissions };
};

