import express from "express";
import Student from "../models/Student.js";
import ClassModel from "../models/Class.js";
import { protect } from "../middleware/authMiddleware.js";
import { student } from "../middleware/roleMiddleware.js";

// Import controller functions
import { 
  setGrade, 
  getAllClasses, 
  getClassContent,
  markMaterialComplete,
  getAssessment,           // NEW
  getSubmission,           // NEW
  submitAssessment,        // NEW
  getClassesByGradeLevel,  // NEW
  getDashboardOverview     // NEW
} from '../controllers/studentController.js';

const router = express.Router();

router.get('/assessment/:assessmentId', protect, student, getAssessment);
router.get('/assessment/:assessmentId/submission', protect, student, getSubmission);
router.post('/assessment/:assessmentId/submit', protect, student, submitAssessment);

// Get classes the current student is enrolled in
router.get("/classes", protect, async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id }).populate({
      path: 'enrolledClasses',
      select: 'name description enrollmentCode'
    });

    if (!student) return res.json({ classes: [] });
    res.json({ classes: student.enrolledClasses });
  } catch (e) {
    console.error(e);
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

    const klass = await ClassModel.findOne({ enrollmentCode });
    
    if (!klass) {
      return res.status(404).json({ msg: "Class not found. Please check the enrollment code." });
    }

    let student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      student = await Student.create({ userId: req.user._id, enrolledClasses: [] });
    }

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

    student.enrolledClasses.push(klass._id);
    klass.enrolledStudents.push(studentId);

    await student.save();
    await klass.save();

    const populated = await Student.findById(student._id).populate({
      path: "enrolledClasses",
      select: "name description"
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

// Set/Update student's grade
router.put('/set-grade', protect, setGrade);

// Get all available classes for enrollment
router.get('/all-classes', protect, getAllClasses);

// Get class content (materials + assignments)
router.get('/class/:classId/content', protect, student, getClassContent);

// Mark material/assignment as complete
router.post('/material/:materialId/complete', protect, student, markMaterialComplete);

// Get classes by grade level (for discovery)
router.get('/classes-by-grade', protect, student, getClassesByGradeLevel);

// Get student dashboard overview
router.get('/dashboard', protect, student, getDashboardOverview);

export default router;