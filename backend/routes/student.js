import express from "express";
import Student from "../models/Student.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get classes the current student is enrolled in
router.get("/classes", protect, async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id }).populate({
      path: "enrolledClasses",
      populate: [{ path: "teacher", select: "userId" }, { path: "enrolledStudents" }],
    });
    if (!student) return res.json({ classes: [] });
    res.json({ classes: student.enrolledClasses });
  } catch (e) {
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;


