import express from "express";
import User from "../models/User.js";
import Teacher from "../models/Teacher.js";
import Student from "../models/Student.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// List users
router.get("/users", protect, isAdmin, async (req, res) => {
  try {
    const users = await User.find({}).select("name email role");
    res.json({ users });
  } catch (e) {
    res.status(500).json({ msg: "Server error" });
  }
});

// List teachers with counts
router.get("/teachers", protect, isAdmin, async (req, res) => {
  try {
    const teachers = await Teacher.find({}).populate("userId", "name email").populate("classes");
    res.json({ teachers });
  } catch (e) {
    res.status(500).json({ msg: "Server error" });
  }
});

// List students
router.get("/students", protect, isAdmin, async (req, res) => {
  try {
    const students = await Student.find({}).populate("userId", "name email").populate("enrolledClasses");
    res.json({ students });
  } catch (e) {
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;


