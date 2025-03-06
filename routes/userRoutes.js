import express from "express";
import { getUsersSpend } from "../controllers/userController.js";

const router = express.Router();

router.get("/spend", getUsersSpend);

export default router;
