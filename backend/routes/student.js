import express from "express";
import Student from "../models/Student.js";
import ClassModel from "../models/Class.js";
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

// Enroll current student into a class by classId
router.post("/enroll", protect, async (req, res) => {
  try {
    const { classId } = req.body;
    if (!classId) return res.status(400).json({ msg: "classId is required" });

    const klass = await ClassModel.findById(classId);
    if (!klass) return res.status(404).json({ msg: "Class not found" });

    let student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      student = await Student.create({ userId: req.user._id, enrolledClasses: [] });
    }

    // Add if not present
    const sId = student._id;
    const alreadyInStudent = student.enrolledClasses.some((id) => id.toString() === classId);
    const alreadyInClass = klass.enrolledStudents.some((id) => id.toString() === sId.toString());
    if (!alreadyInStudent) student.enrolledClasses.push(classId);
    if (!alreadyInClass) klass.enrolledStudents.push(sId);

    await student.save();
    await klass.save();

    const populated = await Student.findById(student._id).populate({
      path: "enrolledClasses",
      populate: [{ path: "teacher" }, { path: "enrolledStudents" }],
    });
    res.status(200).json({ success: true, student: populated });
  } catch (e) {
    res.status(500).json({ msg: "Server error" });
  }
});


