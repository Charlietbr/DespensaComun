import express from "express";
import {
  createTransaction,
  getUserTransactions,
  updateTransactionStatus,
  addMessageToTransaction,
  addFeedback,
  getFeedbackByUserId,
} from "../controllers/transactionControllers.js";

import { authMiddleware } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createTransaction);
router.get("/my-transactions", authMiddleware, getUserTransactions);
router.get("/user-feedback/:userId", authMiddleware, getFeedbackByUserId);
router.patch("/:id/status", authMiddleware, updateTransactionStatus);
router.post("/:id/messages", authMiddleware, addMessageToTransaction);
router.post("/:id/feedback", authMiddleware, addFeedback);

export default router;
