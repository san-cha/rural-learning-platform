import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js"; 
import authRoutes from "./routes/auth.js";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173"],
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running...");
});

// API Routes
app.use("/auth", authRoutes);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
