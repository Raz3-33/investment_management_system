// import { getUserPermissions } from "../utils/fetchingUserPermissions.js";
import { prisma } from "../config/db.js";

// Middleware to check if a user has a specific permission
export const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    const userId = req.user.id;

    try {
      // Fetch the user's permissions from the database
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true, // Include permission details
                },
              },
            },
          },
        },
      });

      // Check if the user has the isAdmin flag
      if (user?.isAdmin) {
        // Admin user has access to all permissions
        return next(); // Allow admin to proceed with the request
      }

      // If the user is not an admin, fetch their permissions and check if they have the required permission
      const permissions = user.role?.permissions.map((p) => p.permission.name);

      if (!permissions?.includes(requiredPermission)) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to perform this action.",
        });
      }

      next(); // Proceed to the actual request handler if permission check passes
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while checking permissions.",
      });
    }
  };
};
