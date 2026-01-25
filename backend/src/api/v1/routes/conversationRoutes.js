import express from "express";
import { authMiddleware } from "../../../middlewares/authMiddleware.js";


const router = express.Router();
import { 
  getOrCreateConversation, 
  getUserChats, 
  getConversationById 
} from "../controllers/conversationControllers.js";



router.get("/user/:userId", authMiddleware, getUserChats);


router.post("/with/:otherUserId", authMiddleware, getOrCreateConversation);


router.get("/:id", authMiddleware, getConversationById);

export default router;