import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  getUserProducts,
  updateProduct,
  deleteProduct,
} from "../controllers/productControllers.js";

import { authMiddleware } from "../../../middlewares/authMiddleware.js";
import { uploadImage, uploadToCloudinary } from "../../../middlewares/uploadImageMiddleware.js";

const router = express.Router();
router.post("/", authMiddleware, uploadImage, uploadToCloudinary, createProduct);
router.get("/", getAllProducts);
router.get("/my-inventory", authMiddleware, getUserProducts); //! chequear getUserProducts
router.get("/user/:userId", authMiddleware, getUserProducts);
router.get("/:id", authMiddleware, getProductById);
router.put("/:id", authMiddleware, uploadImage, uploadToCloudinary, updateProduct);
router.delete("/:id", authMiddleware, deleteProduct);

export default router;
