import express from "express";
import {
  toggleFavorite,
  getMyFavorites,
  checkFavoriteStatus,
} from "../controllers/favoriteControllers.js";
import { authMiddleware } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, toggleFavorite);
router.get("/", authMiddleware, getMyFavorites);
router.get("/check/:id", authMiddleware, checkFavoriteStatus);
router.delete("/:id", authMiddleware, toggleFavorite); //* para borrar desde el mismo botón

export default router;
