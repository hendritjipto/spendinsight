import express from "express";
import { getTransaction } from "../controllers/transactionController.js";
import { getTransactionSearch } from "../controllers/transactionControllerSearch.js";
import { getTransactionPG } from "../controllers/transactionControllerPG.js";

const router = express.Router();

router.get("/", getTransaction);
router.get("/search", getTransactionSearch);
router.get("/pg", getTransactionPG);

export default router;
