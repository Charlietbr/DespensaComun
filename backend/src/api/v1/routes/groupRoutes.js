import express from "express";
import {
  createGroup,
  getAllGroups,
  getGroupById,
  getUserGroups,
  updateGroup,
  deleteGroup,
  // joinGroup,
  requestToJoinGroup,
  approveJoinRequest,
  rejectJoinRequest,
  changeToModerator,
  removeMember,
  leaveGroup,
} from "../controllers/groupControllers.js";

import { authMiddleware } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

//! loguear

router.post("/", authMiddleware, createGroup);
router.get("/", authMiddleware, getAllGroups);
router.get("/:id", authMiddleware, getGroupById);
router.get("/user/:id", authMiddleware, getUserGroups);
router.put("/:id", authMiddleware, updateGroup);
router.delete("/:id", authMiddleware, deleteGroup);

// router.post("/:id/join", authMiddleware, joinGroup);
router.post("/:id/request", authMiddleware, requestToJoinGroup);
router.post("/:id/approve/:userId", authMiddleware, approveJoinRequest);
router.delete("/:id/reject/:userId", authMiddleware, rejectJoinRequest);
router.patch("/:id/role/:userId", authMiddleware, changeToModerator);
router.delete("/:id/member/:userId", authMiddleware, removeMember);

router.post("/:id/leave", authMiddleware, leaveGroup);

export default router;
