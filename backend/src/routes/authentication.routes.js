import express from "express";
import * as authenticationController from "../controller/authentication.controller.js";

const router = express.Router();

router.post("/signup", authenticationController.create);
router.post("/login", authenticationController.login);

export default router;
