// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js"; 
import authRoutes from "./api/auth.js";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));