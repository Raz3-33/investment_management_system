import jwt from "jsonwebtoken";
import sanitizedConfig from "../config.js";
import { prisma } from "../config/db.js";

// Token verification middleware
export async function verifyToken(req, res, next) {
  // Get the authorization header
  const authHeader = req.headers["authorization"];
  
  // Extract the token
  const token = authHeader && authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    console.warn("⛔ No token provided in Authorization header");
    return res.status(403).json({ message: "Token is required" });
  }

  // Verify the token
  jwt.verify(token, sanitizedConfig.JWT_SECRET, async (err, decoded) => {
    if (err) {
      console.error("⛔ Invalid or expired token:", err.message);
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    try {
      // Fetch the user from DB using the ID from the decoded token
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: {
            select: {
              id: true,
              name: true,
            }
          },
        },
      });

      if (!user) {
        console.error("⛔ User not found for ID:", decoded.id);
        return res.status(404).json({ message: "User not found" });
      }

      // Attach user info to the request object
      req.user = user;
      console.log("✅ User authenticated:", user.name);
      
      next(); // Proceed to the next middleware or route handler
    } catch (dbErr) {
      console.error("⛔ Error while fetching user from DB:", dbErr.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
}
