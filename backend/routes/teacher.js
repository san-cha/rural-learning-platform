import express from "express";
import Teacher from "../models/Teacher.js";
import ClassModel from "../models/Class.js";
import { protect, isTeacher } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get classes for current teacher
router.get("/classes", protect, isTeacher, async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.user._id }).populate({
      path: "classes",
      populate: [{ path: "teacher", select: "userId" }, { path: "enrolledStudents" }],
    });
    if (!teacher) return res.status(404).json({ msg: "Teacher profile not found" });
    res.json({ classes: teacher.classes });
  } catch (e) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Create a new class for current teacher
router.post("/classes", protect, isTeacher, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ msg: "Class name is required" });

    let teacher = await Teacher.findOne({ userId: req.user._id });
    if (!teacher) {
      // Auto-create teacher profile if missing
      teacher = await Teacher.create({ userId: req.user._id, classes: [] });
    }

    const newClass = await ClassModel.create({ name, description: description || "", teacher: teacher._id, enrolledStudents: [] });
    teacher.classes.push(newClass._id);
    await teacher.save();

    const populated = await ClassModel.findById(newClass._id).populate("teacher");
    res.status(201).json({ class: populated });
  } catch (e) {
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;


