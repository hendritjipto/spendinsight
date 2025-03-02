import express from "express";
import { getInsight } from "../controllers/spendinsightController.js";

const router = express.Router();

router.get("/", getInsight);

export default router;
