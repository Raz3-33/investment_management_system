import jwt from "jsonwebtoken";
import sanitizedConfig from "../config.js";
import { prisma } from "../config/db.js";

export async function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

    console.log(token,"tokentokentokentokentokentokentokentokentokentoken");
    

  if (!token) {
    console.warn("⛔ No token provided in Authorization header");
    return res.status(403).json({ message: "Token is required" });
  }

  // Verify the token
  jwt.verify(token, sanitizedConfig.JWT_SECRET, async (err, decoded) => {
    if (err) {
      console.error("Invalid token:", err.message);
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    console.log("Decoded token: ", decoded); // Log the decoded token to verify its contents

    try {
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: { select: { id: true, name: true } },
        },
      });

      if (!user) {
        console.error("User not found for ID:", decoded.id);
        return res.status(404).json({ message: "User not found" });
      }

      req.user = user;
      console.log("User authenticated:", user.name);
      next(); // Proceed if the user is found
    } catch (err) {
      console.error("Error fetching user from DB:", err.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
}
