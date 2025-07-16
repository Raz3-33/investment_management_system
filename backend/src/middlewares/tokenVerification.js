import jwt from "jsonwebtoken";
import sanitizedConfig from "../config.js";
import { prisma } from "../config/db.js";

export async function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    console.warn("⛔ No token provided in Authorization header");
    return res.status(403).json({ message: "Token is required" });
  }

  jwt.verify(token, sanitizedConfig.JWT_SECRET, async (err, decoded) => {
    if (err) {
      console.error("⛔ Invalid token:", err.message);
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    try {
      // : Fetch user from DB using ID from token
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, name: true, email: true, role: true },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      req.user = user; // Attach full user info with role
      next();
    } catch (dbErr) {
      console.error("⛔ DB error during user fetch:", dbErr.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
}
