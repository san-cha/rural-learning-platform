//backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js"; 
import authRoutes from "./routes/auth.js";
import ticketRouter from './routes/tickets.js';
import teacherRoutes from "./routes/teacher.js";
import studentRoutes from "./routes/student.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();
connectDB();

const allowedOrigins = ["http://localhost:3000", "http://localhost:5173"];

const app = express();
const PORT = process.env.PORT || 5000;

// app.use(cors({
//   origin: ["http://localhost:3000", "http://localhost:5173"],
//   credentials: true,
// }));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true); 
      // Allow specific origins
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    // Explicitly allow the Cookie header to pass through
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'], 
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.static("uploads")); // Serve uploaded files
app.get("/", (req, res) => {
  res.send("API is running...");
});

// API Routes
app.use("/auth", authRoutes);
app.use('/api/tickets', ticketRouter); // All ticket routes will be at /api/tickets
app.use("/teacher", teacherRoutes);
app.use("/student", studentRoutes);
app.use("/admin", adminRoutes);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
