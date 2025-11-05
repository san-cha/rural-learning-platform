import Teacher from "../models/Teacher.js";
import ClassModel from "../models/Class.js";
import Assignment from "../models/Assignment.js";

/**
 * Get dashboard overview with metrics and active classes
 * GET /teacher/dashboard
 */
export const getDashboardOverview = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.user._id });
    if (!teacher) {
      return res.status(404).json({ msg: "Teacher profile not found" });
    }

    // Get all classes for this teacher
    const classes = await ClassModel.find({ _id: { $in: teacher.classes } });

    // Calculate Total Students: Sum of enrolledStudents.length across all classes
    const totalStudents = classes.reduce(
      (acc, klass) => acc + (klass.enrolledStudents?.length || 0),
      0
    );

    // Get all assignments for this teacher
    const assignments = await Assignment.find({ teacherId: teacher._id });

    // Calculate Assignments to Grade: Count submissions where grade is null
    let assignmentsToGrade = 0;
    assignments.forEach((assignment) => {
      const ungradedSubmissions = assignment.submissions.filter(
        (sub) => sub.grade === null || sub.grade === undefined
      );
      assignmentsToGrade += ungradedSubmissions.length;
    });

    // Calculate Uploaded Content: Count entries in contentURLs array across all assignments
    const uploadedContent = assignments.reduce(
      (acc, assignment) => acc + (assignment.contentURLs?.length || 0),
      0
    );

    // Active Classes List: Return classes with student count
    const activeClasses = classes.map((klass) => ({
      _id: klass._id,
      name: klass.name,
      description: klass.description,
      studentCount: klass.enrolledStudents?.length || 0,
    }));

    res.json({
      totalStudents,
      assignmentsToGrade,
      uploadedContent,
      activeClasses,
    });
  } catch (error) {
    console.error("Error fetching dashboard overview:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

/**
 * Create a new class for the authenticated teacher
 * POST /teacher/classes
 */
export const createClass = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ msg: "Class name is required" });
    }

    let teacher = await Teacher.findOne({ userId: req.user._id });
    if (!teacher) {
      // Auto-create teacher profile if missing
      teacher = await Teacher.create({ userId: req.user._id, classes: [] });
    }

    const newClass = await ClassModel.create({
      name,
      description: description || "",
      teacher: teacher._id,
      enrolledStudents: [],
    });

    teacher.classes.push(newClass._id);
    await teacher.save();

    const populated = await ClassModel.findById(newClass._id).populate("teacher");
    res.status(201).json({ class: populated });
  } catch (error) {
    console.error("Error creating class:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

/**
 * Grade a submission
 * PUT /teacher/submission/:submissionId/grade
 */
export const gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { grade, feedback } = req.body;

    if (grade === undefined || grade === null) {
      return res.status(400).json({ msg: "Grade is required" });
    }

    // Find the assignment containing this submission
    const assignment = await Assignment.findOne({
      "submissions._id": submissionId,
    });

    if (!assignment) {
      return res.status(404).json({ msg: "Submission not found" });
    }

    // Verify the assignment belongs to the authenticated teacher
    const teacher = await Teacher.findOne({ userId: req.user._id });
    if (!teacher || assignment.teacherId.toString() !== teacher._id.toString()) {
      return res.status(403).json({ msg: "Unauthorized to grade this submission" });
    }

    // Find and update the specific submission
    const submission = assignment.submissions.id(submissionId);
    if (!submission) {
      return res.status(404).json({ msg: "Submission not found" });
    }

    submission.grade = grade;
    submission.gradedAt = new Date();
    if (feedback !== undefined) {
      submission.feedback = feedback || "";
    }

    await assignment.save();

    res.json({
      msg: "Submission graded successfully",
      submission: {
        _id: submission._id,
        grade: submission.grade,
        gradedAt: submission.gradedAt,
        feedback: submission.feedback,
      },
    });
  } catch (error) {
    console.error("Error grading submission:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

/**
 * Get class details with enrolled students and assignments
 * GET /teacher/classes/:classId
 */
export const getClassDetails = async (req, res) => {
  try {
    const { classId } = req.params;
    const teacher = await Teacher.findOne({ userId: req.user._id });
    
    if (!teacher) {
      return res.status(404).json({ msg: "Teacher profile not found" });
    }

    // Find the class and verify it belongs to this teacher
    const klass = await ClassModel.findById(classId)
      .populate({
        path: "enrolledStudents",
        populate: { path: "userId", select: "name email" },
      });

    if (!klass) {
      return res.status(404).json({ msg: "Class not found" });
    }

    // Verify the class belongs to this teacher
    if (klass.teacher.toString() !== teacher._id.toString()) {
      return res.status(403).json({ msg: "Unauthorized to view this class" });
    }

    // Get all assignments for this class
    const assignments = await Assignment.find({ classId: klass._id })
      .sort({ createdAt: -1 });

    res.json({
      class: {
        _id: klass._id,
        name: klass.name,
        description: klass.description,
        enrolledStudents: klass.enrolledStudents || [],
        assignments: assignments,
      },
    });
  } catch (error) {
    console.error("Error fetching class details:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

/**
 * Process raw text into quiz structure
 * Basic implementation - can be enhanced with AI/ML later
 */
const processTextToQuiz = (text) => {
  const questions = [];
  // Simple implementation: split by question marks and create basic questions
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  // Create a simple question from each sentence (placeholder logic)
  sentences.slice(0, 5).forEach((sentence, index) => {
    if (sentence.trim().length > 20) {
      questions.push({
        question: sentence.trim() + "?",
        options: [
          "True",
          "False",
          "Maybe",
          "Not sure"
        ],
        correctAnswer: 0, // Default to first option
      });
    }
  });

  return questions.length > 0 ? questions : [{
    question: "Sample question from the provided text?",
    options: ["Option 1", "Option 2", "Option 3", "Option 4"],
    correctAnswer: 0,
  }];
};

/**
 * Create a new assignment
 * POST /teacher/classes/:classId/assignments
 */
export const createAssignment = async (req, res) => {
  try {
    const { classId } = req.params;
    const { title, description, assignmentType, quizData, rawText, dueDate } = req.body;
    
    if (!title) {
      return res.status(400).json({ msg: "Assignment title is required" });
    }

    const teacher = await Teacher.findOne({ userId: req.user._id });
    if (!teacher) {
      return res.status(404).json({ msg: "Teacher profile not found" });
    }

    // Verify the class belongs to this teacher
    const klass = await ClassModel.findById(classId);
    if (!klass) {
      return res.status(404).json({ msg: "Class not found" });
    }

    if (klass.teacher.toString() !== teacher._id.toString()) {
      return res.status(403).json({ msg: "Unauthorized to create assignment for this class" });
    }

    // Handle file upload (if file was uploaded via multer)
    let contentURLs = [];
    if (req.file) {
      // File path will be available in req.file.path
      // In production, you'd upload to cloud storage and get a URL
      const fileUrl = `/uploads/${req.file.filename}`;
      contentURLs.push(fileUrl);
    }

    // Handle different assignment types
    let assignmentData = {
      title,
      description: description || "",
      classId: klass._id,
      teacherId: teacher._id,
      assignmentType: assignmentType || "file",
      contentURLs,
      dueDate: dueDate ? new Date(dueDate) : null,
    };

    if (assignmentType === "manual-quiz" && quizData) {
      assignmentData.quizData = {
        questions: Array.isArray(quizData.questions) ? quizData.questions : [],
      };
    } else if (assignmentType === "text-to-quiz" && rawText) {
      const processedQuiz = processTextToQuiz(rawText);
      assignmentData.quizData = {
        questions: processedQuiz,
      };
    }

    const newAssignment = await Assignment.create(assignmentData);
    const populated = await Assignment.findById(newAssignment._id)
      .populate("classId", "name")
      .populate("teacherId", "userId");

    res.status(201).json({
      msg: "Assignment created successfully",
      assignment: populated,
    });
  } catch (error) {
    console.error("Error creating assignment:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

