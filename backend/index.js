import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { connectDB } from "./src/config/connectDB.js";



import favoriteRoutes from "./src/api/v1/routes/favoriteRoutes.js";
import groupRoutes from "./src/api/v1/routes/groupRoutes.js";
import messageRoutes from "./src/api/v1/routes/messageRoutes.js";
import productRoutes from "./src/api/v1/routes/productRoutes.js";
import transactionRoutes from "./src/api/v1/routes/transactionRoutes.js";
import userRoutes from "./src/api/v1/routes/userRoutes.js";
import conversationRoutes from "./src/api/v1/routes/conversationRoutes.js";


const app = express();
app.use(express.json());
app.use(cors());


app.use("/api/v1/favorites", favoriteRoutes);
app.use("/api/v1/groups", groupRoutes);
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/transactions", transactionRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/conversations", conversationRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
// app.use("/*", (req, res, next) => {return res.status(404).json("Route not found")});

app.use((req, res) => {res.status(404).json({ message: "Route not found" });
});



connectDB();