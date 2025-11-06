import express from "express";
import User from "../models/User.js";
import Teacher from "../models/Teacher.js";
// import Student from "../models/Student.js";
import ClassModel from "../models/Class.js";
import Ticket from "../models/Ticket.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import ContentModule from "../models/ContentModule.js";
// import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

// GET /api/admin/stats - Get dashboard statistics
router.get("/stats", protect, isAdmin, async (req, res) => {
  try {
    const [studentCount, teacherCount, technicianCount, classCount, openTicketsCount] = await Promise.all([
      User.countDocuments({ role: 'student' }), 
      User.countDocuments({ role: 'teacher' }),
      User.countDocuments({ role: 'technician' }),
      ClassModel.countDocuments(),
      Ticket.countDocuments({ status: { $ne: 'resolved' } }),
    ]);

    // Send all the counts back in one object
    res.json({
      students: studentCount,
      teachers: teacherCount,
      technicians: technicianCount,
      classes: classCount,
      supportTicketsOpen: openTicketsCount,
    });

  } catch (e) {
    console.error(e.message);
    res.status(500).json({ msg: "Server error" });
  }
});

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

router.get('/content', protect, isAdmin, async (req, res) => { // 👈 Use protect, isAdmin
      try {
        // Fetch necessary fields for the dashboard table
        const modules = await ContentModule.find({})
            .select('_id title localizationStatus offlineDownloads status')
            .lean(); 

        res.json({
            success: true,
            modules
        });
    } catch (error) {
        console.error("Error fetching content:", error);
        res.status(500).json({ success: false, message: 'Server error fetching content.' });
    }
});

// Extra: list classes (for completeness; UI may or may not use this)
router.get("/classes", protect, isAdmin, async (req, res) => {
  try {
    const classes = await ClassModel.find({}).populate("teacher").populate("enrolledStudents");
    res.json({ classes });
  } catch (e) {
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;