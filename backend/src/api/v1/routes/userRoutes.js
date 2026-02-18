import express from "express";
import {
  registerUser,
  loginUser,
  updateUser,
  deleteUser,
  getUserById,
  getAllUsers,
  updateUserRole
} from "../controllers/userControllers.js";

import { uploadImage, uploadToCloudinary } from "../../../middlewares/uploadImageMiddleware.js";
import { authMiddleware } from "../../../middlewares/authMiddleware.js";

const router = express.Router();


//* publicas

router.post("/register", uploadToCloudinary, registerUser);
router.post("/login", loginUser);

//! con auth

router.get("/", authMiddleware, getAllUsers);
router.get("/:id", authMiddleware, getUserById);
router.put("/:id", authMiddleware, uploadImage, uploadToCloudinary, updateUser);
router.patch("/:id/role/:userId", authMiddleware, updateUserRole);
router.delete("/:id", authMiddleware, deleteUser);

export default router;
