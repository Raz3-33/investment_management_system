// middlewares/checkRoleTabAccess.js
import { prisma } from "../config/db.js";

export async function checkRoleTabAccess(req, res, next) {
  try {
    const requestedRole = (req.query.role || "").toLowerCase(); // 'legal' | 'finance' | 'admin'
    if (!["legal", "finance", "admin"].includes(requestedRole)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    // Fetch user role + isAdmin. If verifyToken already attaches, reuse that.
    const userId = req.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const isAdmin = !!user.isAdmin;
    const userRoleName = (user.role?.name || "").toLowerCase(); // expect 'legal' or 'finance' for non-admins

    if (isAdmin) {
      // admin can access all tabs
      return next();
    }

    // Non-admins: must match their own role exactly; they cannot request 'admin'
    const allowed = (userRoleName === "legal" && requestedRole === "legal") ||
                    (userRoleName === "finance" && requestedRole === "finance");

    if (!allowed) {
      return res.status(403).json({ success: false, message: "Forbidden: role tab is locked" });
    }

    return next();
  } catch (err) {
    return res.status(500).json({ success: false, message: "Access check failed" });
  }
}
