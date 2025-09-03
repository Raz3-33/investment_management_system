import express from "express";
import * as territoryController from "../controller/territory.controller.js";
import { verifyToken } from "../middlewares/tokenVerification.js";
import { checkPermission } from "../middlewares/checkPermission.js";

const router = express.Router();

router.get(
  "/",
  verifyToken,
  checkPermission("Settings:view"),
  territoryController.getAll
);

router.get(
  "/:id",
  verifyToken,
  checkPermission("Settings:view"),
  territoryController.getById
);

router.post(
  "/",
  verifyToken,
  checkPermission("Settings:create"),
  territoryController.create
);

router.put(
  "/:id",
  verifyToken,
  checkPermission("Settings:update"),
  territoryController.update
);

router.delete(
  "/:id",
  verifyToken,
  checkPermission("Settings:delete"),
  territoryController.removeTerritory
);

export default router;
