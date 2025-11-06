import express from "express";
import Student from "../models/Student.js";
import ClassModel from "../models/Class.js";
import { protect } from "../middleware/authMiddleware.js";
import { setGrade, getAllClasses } from '../controllers/studentController.js';

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

// Enroll current student into a class by enrollmentCode
router.post("/enroll", protect, async (req, res) => {
  try {
    const { enrollmentCode } = req.body;
    
    if (!enrollmentCode) {
      return res.status(400).json({ msg: "Enrollment code is required" });
    }

    // Find the class using the enrollment code
    const klass = await ClassModel.findOne({ enrollmentCode });
    
    if (!klass) {
      return res.status(404).json({ msg: "Class not found. Please check the enrollment code." });
    }

    // Find or create student profile
    let student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      student = await Student.create({ userId: req.user._id, enrolledClasses: [] });
    }

    // Check if student is already enrolled
    const studentId = student._id;
    const alreadyInStudent = student.enrolledClasses.some(
      (id) => id.toString() === klass._id.toString()
    );
    const alreadyInClass = klass.enrolledStudents.some(
      (id) => id.toString() === studentId.toString()
    );

    if (alreadyInStudent || alreadyInClass) {
      return res.status(400).json({ msg: "You are already enrolled in this class" });
    }

    // Add student to class and class to student
    student.enrolledClasses.push(klass._id);
    klass.enrolledStudents.push(studentId);

    await student.save();
    await klass.save();

    // Populate and return updated student data
    const populated = await Student.findById(student._id).populate({
      path: "enrolledClasses",
      populate: [{ path: "teacher", select: "userId" }, { path: "enrolledStudents" }],
    });

    res.status(200).json({ 
      success: true, 
      msg: "Successfully enrolled in class",
      student: populated 
    });
  } catch (e) {
    console.error("Error enrolling student:", e);
    res.status(500).json({ msg: "Server error" });
  }
});
router.put('/set-grade', protect, setGrade);
router.get('/all-classes', protect, getAllClasses);
export default router;


