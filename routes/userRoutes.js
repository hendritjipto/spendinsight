import express from "express";
import { getUsersSpend,getUsersProfile } from "../controllers/userController.js";

const router = express.Router();

router.get("/spend", getUsersSpend);
router.get("/profile", getUsersProfile);

export default router;
