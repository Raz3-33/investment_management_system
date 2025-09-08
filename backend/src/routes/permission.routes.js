// routes/me.router.js
import express from "express";
import { prisma } from "../config/db.js";
import { verifyToken } from "../middlewares/tokenVerification.js";

const router = express.Router();

router.get("/me/permissions", verifyToken, async (req, res) => {

  console.log("req.user", req.user);
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        role: {
          include: {
            permissions: { include: { permission: true } },
          },
        },
      },
    });
console.log("useruseruseruseruseruseruser", user);

    const isAdmin = Boolean(user?.isAdmin);
    const permissions = isAdmin
      ? ["*"]
      : (user?.role?.permissions ?? []).map((rp) => rp.permission.name);

    return res.status(200).json({ success: true, isAdmin, permissions });
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load permissions" });
  }
});

export default router;
