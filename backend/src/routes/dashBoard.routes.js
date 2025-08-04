import express from "express";
import * as dashBoardController from "../controller/dashBoard.controller.js";

const router = express.Router();

// Get all branches
router.get("/findDashboard", dashBoardController.findDashboard);

export default router;
