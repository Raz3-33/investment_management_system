import * as roleService from "../services/role.service.js";
import { roleSchema } from "../validations/role.schema.js";

export const getAll = async (req, res) => {
  const roles = await roleService.getAllRoles();
  res.json(roles);
};

export const getRoleDetails = async (req, res) => {
  try {
    const { roleId } = req.params;

    if (!roleId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing roleId" });
    }

    const role = await roleService.getRoleWithPermissions(roleId);

    if (!role) {
      return res
        .status(404)
        .json({ success: false, message: "Role not found" });
    }

    res.status(200).json({ success: true, data: role });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch role details",
      error: error.message,
    });
  }
};

export const create = async (req, res, next) => {
  try {
    const validated = req.body;
    const role = await roleService.createRole(validated);
    res.status(201).json({ success: true, data: role });
  } catch (err) {
    if (err.code === "P2002") {
      // Prisma unique constraint violation
      return res.status(409).json({
        success: false,
        message: `Role name '${req.body.name}' already exists.`,
      });
    }
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const validated = roleSchema.parse(req.body);
    const role = await roleService.updateRole(req.params.id, validated);
    res.json(role);
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    await roleService.deleteRole(req.params.id);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
