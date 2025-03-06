import express from "express";
import { getTransaction } from "../controllers/transactionController.js";

const router = express.Router();

router.get("/", getTransaction);

export default router;
