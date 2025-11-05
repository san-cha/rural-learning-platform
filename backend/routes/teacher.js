import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import Teacher from "../models/Teacher.js";
import ClassModel from "../models/Class.js";
import Notification from "../models/Notification.js";
import { protect, isTeacher } from "../middleware/authMiddleware.js";
import { 
  getDashboardOverview,
  getDashboardData,
  createClass, 
  gradeSubmission, 
  getClassDetails, 
  createAssignment,
  getAssignmentDetails,
  updateAssignment,
  uploadMaterial,
  getClassMaterials
} from "../controllers/teacherController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  // Allow images, PDFs, and videos
  if (
    file.mimetype.startsWith("image/") || 
    file.mimetype === "application/pdf" ||
    file.mimetype.startsWith("video/")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only images, PDF, and video files are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB limit for videos

const router = express.Router();

// Dashboard overview
router.get("/dashboard", protect, isTeacher, getDashboardOverview);

// Dashboard data (comprehensive)
router.get("/dashboard-data", protect, isTeacher, getDashboardData);

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

// Get class details with students and assignments
router.get("/classes/:classId", protect, isTeacher, getClassDetails);

// Create a new class for current teacher
router.post("/classes", protect, isTeacher, createClass);

// Create assignment for a class
router.post("/classes/:classId/assignments", protect, isTeacher, upload.single("file"), createAssignment);

// Get assignment details
router.get("/assignments/:assignmentId", protect, isTeacher, getAssignmentDetails);

// Update assignment
router.put("/assignments/:assignmentId", protect, isTeacher, upload.single("file"), updateAssignment);

// Upload study material
router.post("/classes/:classId/materials", protect, isTeacher, upload.single("file"), uploadMaterial);

// Get all materials for a class
router.get("/classes/:classId/materials", protect, isTeacher, getClassMaterials);

// Grade a submission
router.put("/submission/:submissionId/grade", protect, isTeacher, gradeSubmission);

// Teacher notifications - list
router.get("/notifications", protect, isTeacher, async (req, res) => {
  try {
    const notes = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ notifications: notes });
  } catch (e) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Teacher notifications - mark read
router.post("/notifications/:id/read", protect, isTeacher, async (req, res) => {
  try {
    const { id } = req.params;
    const note = await Notification.findOneAndUpdate({ _id: id, userId: req.user._id }, { read: true }, { new: true });
    if (!note) return res.status(404).json({ msg: "Not found" });
    res.json({ notification: note });
  } catch (e) {
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;


