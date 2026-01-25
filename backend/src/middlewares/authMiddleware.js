import jwt from "jsonwebtoken";
import User from "../api/v1/models/user.js";

export const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "Token no proporcionado." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("_id role");
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido o expirado." });
  }
};