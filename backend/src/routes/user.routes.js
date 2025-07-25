import express from "express";
import * as userController from "../controller/user.controller.js";
import { verifyToken } from "../middlewares/tokenVerification.js"; // Import token verification middleware
import { checkPermission } from "../middlewares/checkPermission.js"; // Import permission check middleware

const router = express.Router();

// Apply verifyToken middleware to all routes first to ensure the user is authenticated
router.use(verifyToken);

// Get all users (requires permission: "User Management:view")
router.get("/", checkPermission("User Management:view"), userController.getAllUsers);

// Get user details by ID (requires permission: "User Management:view")
router.get("/:id", checkPermission("User Management:view"), userController.getUserDetails);

// Create a new user (requires permission: "User Management:create")
router.post("/", checkPermission("User Management:create"), userController.createUser);

// Update user by ID (requires permission: "User Management:update")
router.put("/:id", checkPermission("User Management:update"), userController.updateUser);

// Delete user by ID (requires permission: "User Management:delete")
router.delete("/:id", checkPermission("User Management:delete"), userController.deleteUser);

export default router;
