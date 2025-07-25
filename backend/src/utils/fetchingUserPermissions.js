// Function to fetch user's permissions
export const getUserPermissions = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true, // Include permission details
            }
          }
        }
      }
    }
  });

  // If the user has isAdmin set to true, return an empty array, as admin should have all access
  if (user?.isAdmin) {
    return [];  // Admin has access to everything, so we return an empty array (no restrictions)
  }

  // If user or role is not found, return empty permissions
  if (!user || !user.role) {
    return [];
  }

  // Extract permissions from the user's role
  const permissions = user.role.permissions.map(p => p.permission.name);

  return permissions;
};
