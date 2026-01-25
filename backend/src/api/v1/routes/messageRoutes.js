import express from "express";
import {
  sendMessage,

  getGroupMessages,
  getMessagesByConversation,
} from "../../../api/v1/controllers/messageControllers.js";

import { authMiddleware } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, sendMessage);
router.get("/conversation/:conversationId", authMiddleware, getMessagesByConversation);
router.get("/group/:groupId", authMiddleware, getGroupMessages);

export default router;
