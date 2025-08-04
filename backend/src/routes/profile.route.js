import express from "express";
import { getProfile, updatePassword } from "../controller/profile.controller.js";


const router = express.Router();

// Get all payouts for an investment
router.get("/findUsers", getProfile);

router.put("/updatePassword", updatePassword);


export default router;
