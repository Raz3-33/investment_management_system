import * as roleService from "../services/role.service.js";
// import { roleSchema } from "../validations/role.schema.js";

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
    const validatedData = req.body;
    const { role, permissions } = await roleService.createRole(validatedData);
    res.status(201).json({ success: true, data: { role, permissions } });
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  const { id } = req.params;
  try {
    const updatedData = req.body;
    const { role, permissions } = await roleService.updateRole(id, updatedData);
    res.status(200).json({ success: true, data: { role, permissions } });
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
