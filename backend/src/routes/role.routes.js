import express from "express";
import * as roleController from "../controller/role.controller.js";
import { checkPermission } from "../middlewares/checkPermission.js";
import { verifyToken } from "../middlewares/tokenVerification.js";

const router = express.Router();

// Protect the routes with token verification and permission check

// Get all roles - only accessible by users with "Role Management:view" permission
router.get("/", verifyToken, checkPermission("Role Management:view"), roleController.getAll);

// Get specific role details by role ID - only accessible by users with "Role Management:view" permission
router.get("/role/:roleId", verifyToken, checkPermission("Role Management:view"), roleController.getRoleDetails);

// Create a new role - only accessible by users with "Role Management:create" permission
router.post("/", verifyToken, checkPermission("Role Management:create"), roleController.create);

// Update an existing role - only accessible by users with "Role Management:update" permission
router.put("/:id", verifyToken, checkPermission("Role Management:update"), roleController.update);

// Delete a role - only accessible by users with "Role Management:delete" permission
router.delete("/:id", verifyToken, checkPermission("Role Management:delete"), roleController.remove);

export default router;
