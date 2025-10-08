// // src/backend/auth.js
// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import mongoose from "mongoose";
// import authRoutes from "./auth.js"; // <-- THIS PATH IS CORRECT

// dotenv.config();
// const app = express();

// app.use(cors());
// app.use(express.json());

// // Use auth routes
// app.use("/api/auth", authRoutes);

// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log("MongoDB connected"))
//   .catch(err => console.log(err));

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
