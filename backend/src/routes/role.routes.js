import express from "express";
import * as roleController from "../controller/role.controller.js";

const router = express.Router();

router.get("/", roleController.getAll);
router.get("/role/:roleId", roleController.getRoleDetails);
router.post("/", roleController.create);
router.put("/:id", roleController.update);
router.delete("/:id", roleController.remove);

export default router;
