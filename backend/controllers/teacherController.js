import Teacher from "../models/Teacher.js";
import ClassModel from "../models/Class.js";
import Assignment from "../models/Assignment.js";
import Material from "../models/Material.js";

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

    // Active Classes List: Return classes with student count and gradeLevel
    const activeClasses = classes.map((klass) => ({
      _id: klass._id,
      name: klass.name,
      description: klass.description,
      gradeLevel: klass.gradeLevel,
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
 * Get comprehensive dashboard data
 * GET /teacher/dashboard-data
 */
export const getDashboardData = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.user._id });
    if (!teacher) {
      return res.status(404).json({ msg: "Teacher profile not found" });
    }

    // Get all classes for this teacher
    const classes = await ClassModel.find({ _id: { $in: teacher.classes } })
      .populate("enrolledStudents");

    // Calculate totalStudentsCount: Count of all unique students enrolled across all classes
    const uniqueStudentIds = new Set();
    classes.forEach((klass) => {
      if (Array.isArray(klass.enrolledStudents)) {
        klass.enrolledStudents.forEach((student) => {
          if (student?._id) {
            uniqueStudentIds.add(student._id.toString());
          }
        });
      }
    });
    const totalStudentsCount = uniqueStudentIds.size;

    // Get all assignments for this teacher
    const assignments = await Assignment.find({ teacherId: teacher._id });

    // Calculate assignmentsToGradeCount: Count of all submissions with grade === null
    let assignmentsToGradeCount = 0;
    assignments.forEach((assignment) => {
      const ungradedSubmissions = assignment.submissions.filter(
        (sub) => sub.grade === null || sub.grade === undefined
      );
      assignmentsToGradeCount += ungradedSubmissions.length;
    });

    // Get all materials for this teacher's classes
    const classIds = classes.map((klass) => klass._id);
    const materials = await Material.find({ classId: { $in: classIds } });

    // Calculate uploadedContentCount: Total count of Assignment and Material documents
    const uploadedContentCount = assignments.length + materials.length;

    // Get recentContent: 5 most recently created Assignment and Material documents
    const allContent = [
      ...assignments.map((a) => ({
        _id: a._id,
        title: a.title,
        type: "Assignment",
        createdAt: a.createdAt,
        classId: a.classId,
      })),
      ...materials.map((m) => ({
        _id: m._id,
        title: m.title,
        type: "Material",
        createdAt: m.createdAt,
        classId: m.classId,
      })),
    ];

    // Sort by creation date (newest first) and take top 5
    const recentContent = allContent
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((item) => ({
        _id: item._id,
        title: item.title,
        type: item.type,
        createdAt: item.createdAt,
        classId: item.classId,
      }));

    // Active Classes List: Return classes with student count
    const activeClasses = classes.map((klass) => ({
      _id: klass._id,
      name: klass.name,
      description: klass.description,
      studentCount: klass.enrolledStudents?.length || 0,
    }));

    res.json({
      totalStudentsCount,
      assignmentsToGradeCount,
      uploadedContentCount,
      recentContent,
      activeClasses,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

/**
 * Create a new class for the authenticated teacher
 * POST /teacher/classes
 */
export const createClass = async (req, res) => {
  try {
    const { name, description, gradeLevel } = req.body;
    if (!name) {
      return res.status(400).json({ msg: "Class name is required" });
    }
    if (!gradeLevel) {
      return res.status(400).json({ msg: "Grade level is required" });
    }

    // Validate gradeLevel enum
    const validGradeLevels = [
      "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
      "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10",
      "Grade 11", "Grade 12", "College"
    ];
    if (!validGradeLevels.includes(gradeLevel)) {
      return res.status(400).json({ msg: "Invalid grade level. Must be one of: " + validGradeLevels.join(", ") });
    }

    let teacher = await Teacher.findOne({ userId: req.user._id });
    if (!teacher) {
      // Auto-create teacher profile if missing
      teacher = await Teacher.create({ userId: req.user._id, classes: [] });
    }

    // Generate unique enrollment code
    const generateEnrollmentCode = () => {
      // Generate 8-character alphanumeric code
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    // Ensure code is unique
    let enrollmentCode;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      enrollmentCode = generateEnrollmentCode();
      const existingClass = await ClassModel.findOne({ enrollmentCode });
      if (!existingClass) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({ msg: "Failed to generate unique enrollment code. Please try again." });
    }

    const newClass = await ClassModel.create({
      name,
      description: description || "",
      teacher: teacher._id,
      enrolledStudents: [],
      enrollmentCode,
      gradeLevel,
    });

    teacher.classes.push(newClass._id);
    await teacher.save();

    const populated = await ClassModel.findById(newClass._id).populate("teacher");
    res.status(201).json({ 
      class: populated,
      enrollmentCode: enrollmentCode // Include in response for frontend display
    });
  } catch (error) {
    console.error("Error creating class:", error);
    if (error.code === 11000 && error.keyPattern?.enrollmentCode) {
      // Duplicate enrollment code error
      return res.status(500).json({ msg: "Enrollment code conflict. Please try again." });
    }
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
 * Get class details with enrolled students, assignments, and materials
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

    // Get all materials for this class
    const materials = await Material.find({ classId: klass._id })
      .populate("uploadedBy", "name")
      .sort({ createdAt: -1 });

    res.json({
      class: {
        _id: klass._id,
        name: klass.name,
        description: klass.description,
        enrollmentCode: klass.enrollmentCode,
        enrolledStudents: klass.enrolledStudents || [],
        assignments: assignments,
        materials: materials,
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

    // Handle file uploads (Cloudinary via uploadMiddleware)
    let contentURLs = [];
    if (req.files && req.files.length > 0) {
      // req.files is an array of uploaded files from Cloudinary
      // Each file has a 'path' property which is the Cloudinary URL
      contentURLs = req.files.map(file => file.path);
    }

    // Parse quizData if it's a string (from FormData)
    let parsedQuizData = quizData;
    if (typeof quizData === 'string') {
      try {
        parsedQuizData = JSON.parse(quizData);
      } catch (e) {
        console.error("Error parsing quizData:", e);
        parsedQuizData = null;
      }
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

    if (assignmentType === "manual-quiz" && parsedQuizData) {
      assignmentData.quizData = {
        questions: Array.isArray(parsedQuizData.questions) ? parsedQuizData.questions : [],
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

/**
 * Get assignment details
 * GET /teacher/assignments/:assignmentId
 */
export const getAssignmentDetails = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    console.log("=== getAssignmentDetails DEBUG ===");
    console.log("Assignment ID from params:", assignmentId);
    console.log("Authenticated user ID:", req.user._id);
    
    // Find the Assignment by ID (DO NOT populate yet - we need the raw classId)
    const assignment = await Assignment.findById(assignmentId);
    
    if (!assignment) {
      console.log("Assignment not found");
      return res.status(404).json({ msg: "Assignment not found" });
    }
    
    console.log("Assignment found - classId:", assignment.classId);
    console.log("Assignment found - teacherId (raw):", assignment.teacherId);
    
    // Find the Class associated with this Assignment
    const klass = await ClassModel.findById(assignment.classId);
    
    if (!klass) {
      console.log("Class not found for assignment");
      return res.status(404).json({ msg: "Class not found for this assignment" });
    }
    
    console.log("Class found - teacher field:", klass.teacher);
    
    // Find the Teacher profile for the authenticated user
    const teacher = await Teacher.findOne({ userId: req.user._id });
    
    if (!teacher) {
      console.log("Teacher profile not found");
      return res.status(404).json({ msg: "Teacher profile not found" });
    }
    
    console.log("Teacher profile ID:", teacher._id);
    console.log("Class teacher ID:", klass.teacher.toString());
    console.log("Teacher profile ID:", teacher._id.toString());
    
    // VERIFY: Check if the authenticated teacher's ID matches the Class's 'teacher' field
    if (klass.teacher.toString() !== teacher._id.toString()) {
      console.log("❌ AUTHORIZATION FAILED - Teacher IDs do not match");
      console.log("Class teacher:", klass.teacher.toString());
      console.log("Current teacher:", teacher._id.toString());
      return res.status(403).json({ msg: "Unauthorized to view this assignment" });
    }
    
    console.log("✅ AUTHORIZATION SUCCESS - Teacher is authorized");
    
    // Now populate the assignment for response (after authorization check)
    const populatedAssignment = await Assignment.findById(assignmentId)
      .populate("classId", "name description")
      .populate("teacherId", "userId");
    
    // Return the assignment object
    res.json({ 
      assignment: populatedAssignment,
      msg: "Assignment retrieved successfully"
    });
  } catch (error) {
    console.error("Error fetching assignment details:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

/**
 * Update assignment
 * PUT /teacher/assignments/:assignmentId
 */
export const updateAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    
    // Parse body data - handle both JSON and form-data
    let { title, description, assignmentType, quizData, rawText, dueDate } = req.body;
    
    // If quizData is a string (from FormData), parse it
    if (typeof quizData === 'string') {
      try {
        quizData = JSON.parse(quizData);
      } catch (e) {
        console.error("Error parsing quizData:", e);
        quizData = null;
      }
    }
    
    console.log("=== updateAssignment DEBUG ===");
    console.log("Assignment ID from params:", assignmentId);
    console.log("Authenticated user ID:", req.user._id);
    
    // Find the Assignment by ID (DO NOT populate yet - we need the raw classId)
    const existingAssignment = await Assignment.findById(assignmentId);
    
    if (!existingAssignment) {
      console.log("Assignment not found");
      return res.status(404).json({ msg: "Assignment not found" });
    }
    
    console.log("Assignment found - classId:", existingAssignment.classId);
    console.log("Assignment found - teacherId (raw):", existingAssignment.teacherId);
    
    // Find the Class associated with this Assignment
    const klass = await ClassModel.findById(existingAssignment.classId);
    
    if (!klass) {
      console.log("Class not found for assignment");
      return res.status(404).json({ msg: "Class not found for this assignment" });
    }
    
    console.log("Class found - teacher field:", klass.teacher);
    
    // Find the Teacher profile for the authenticated user
    const teacher = await Teacher.findOne({ userId: req.user._id });
    
    if (!teacher) {
      console.log("Teacher profile not found");
      return res.status(404).json({ msg: "Teacher profile not found" });
    }
    
    console.log("Teacher profile ID:", teacher._id);
    console.log("Class teacher ID:", klass.teacher.toString());
    console.log("Teacher profile ID:", teacher._id.toString());
    
    // VERIFY: Check if the authenticated teacher's ID matches the Class's 'teacher' field
    if (klass.teacher.toString() !== teacher._id.toString()) {
      console.log("❌ AUTHORIZATION FAILED - Teacher IDs do not match");
      console.log("Class teacher:", klass.teacher.toString());
      console.log("Current teacher:", teacher._id.toString());
      return res.status(403).json({ msg: "Unauthorized to edit this assignment" });
    }
    
    console.log("✅ AUTHORIZATION SUCCESS - Teacher is authorized to edit");

    // Build update object
    const updateData = {
      lastEdited: new Date(),
    };

    // Update basic fields if provided
    if (title !== undefined && title !== null) updateData.title = title;
    if (description !== undefined) updateData.description = description || "";
    if (assignmentType !== undefined) updateData.assignmentType = assignmentType;
    
    if (dueDate !== undefined && dueDate !== null && dueDate !== "") {
      updateData.dueDate = new Date(dueDate);
    } else if (dueDate === "" || dueDate === null) {
      updateData.dueDate = null;
    }

    // Handle file update if new file is uploaded
    if (req.file) {
      const fileUrl = `/uploads/${req.file.filename}`;
      updateData.contentURLs = [fileUrl];
    }

    // Handle quiz data updates based on assignment type
    if (assignmentType === "manual-quiz" && quizData) {
      // Ensure quizData is properly structured
      const questions = Array.isArray(quizData.questions) ? quizData.questions : [];
      updateData.quizData = {
        questions: questions,
      };
    } else if (assignmentType === "text-to-quiz" && rawText) {
      const processedQuiz = processTextToQuiz(rawText);
      updateData.quizData = {
        questions: processedQuiz,
      };
    } else if (assignmentType === "file") {
      // Clear quiz data for file type
      updateData.quizData = { questions: [] };
    }

    // Use findByIdAndUpdate with $set for nested updates
    const updatedAssignment = await Assignment.findByIdAndUpdate(
      assignmentId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate("classId", "name")
      .populate("teacherId", "userId");

    if (!updatedAssignment) {
      return res.status(404).json({ msg: "Assignment not found after update" });
    }

    res.json({
      msg: "Assignment updated successfully",
      assignment: updatedAssignment,
    });
  } catch (error) {
    console.error("Error updating assignment:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

/**
 * Upload study material
 * POST /teacher/classes/:classId/materials
 */
export const uploadMaterial = async (req, res) => {
  try {
    const { classId } = req.params;
    const { title, type } = req.body;

    if (!title || !type) {
      return res.status(400).json({ msg: "Title and type are required" });
    }

    if (!req.file) {
      return res.status(400).json({ msg: "File is required" });
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
      return res.status(403).json({ msg: "Unauthorized to upload material for this class" });
    }

    // Create material document
    const material = await Material.create({
      classId: klass._id,
      title,
      type,
      filePath: `/uploads/${req.file.filename}`,
      uploadedBy: req.user._id,
    });

    const populated = await Material.findById(material._id)
      .populate("uploadedBy", "name")
      .populate("classId", "name");

    res.status(201).json({
      msg: "Material uploaded successfully",
      material: populated,
    });
  } catch (error) {
    console.error("Error uploading material:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

/**
 * Get all materials for a class
 * GET /teacher/classes/:classId/materials
 */
export const getClassMaterials = async (req, res) => {
  try {
    const { classId } = req.params;
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
      return res.status(403).json({ msg: "Unauthorized to view materials for this class" });
    }

    // Get all materials for this class
    const materials = await Material.find({ classId: klass._id })
      .populate("uploadedBy", "name")
      .sort({ createdAt: -1 });

    res.json({ materials });
  } catch (error) {
    console.error("Error fetching materials:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

/**
 * Get all submissions for an assignment (Google Classroom style)
 * Shows which students turned in work and which didn't
 * GET /teacher/assignments/:assignmentId/submissions
 */
export const getAssignmentSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const teacher = await Teacher.findOne({ userId: req.user._id });
    
    if (!teacher) {
      return res.status(404).json({ msg: "Teacher profile not found" });
    }

    // Find the assignment
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ msg: "Assignment not found" });
    }

    // Verify assignment belongs to this teacher
    if (assignment.teacherId.toString() !== teacher._id.toString()) {
      return res.status(403).json({ msg: "Unauthorized to view this assignment" });
    }

    // Get the class to find all enrolled students
    const klass = await ClassModel.findById(assignment.classId)
      .populate({
        path: 'enrolledStudents',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      });

    if (!klass) {
      return res.status(404).json({ msg: "Class not found" });
    }

    // Get all submissions for this assignment
    const Submission = (await import('../models/Submission.js')).default;
    const submissions = await Submission.find({ assignmentId: assignmentId })
      .populate('studentId', 'name email')
      .sort({ submittedAt: -1 });

    // Create a map of submissions by student ID
    const submissionMap = {};
    submissions.forEach(sub => {
      submissionMap[sub.studentId._id.toString()] = sub;
    });

    // Build the response with all students
    const studentsWithStatus = klass.enrolledStudents.map(student => {
      const studentUserId = student.userId._id.toString();
      const submission = submissionMap[studentUserId];
      
      return {
        studentId: studentUserId,
        studentName: student.userId.name,
        studentEmail: student.userId.email,
        status: submission ? 'turned-in' : 'not-submitted',
        submission: submission || null,
        submittedAt: submission?.submittedAt || null,
        grade: submission?.grade || null,
        feedback: submission?.feedback || null
      };
    });

    // Separate into turned in and not submitted
    const turnedIn = studentsWithStatus.filter(s => s.status === 'turned-in');
    const notSubmitted = studentsWithStatus.filter(s => s.status === 'not-submitted');

    res.json({
      assignment: {
        _id: assignment._id,
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate,
        assignmentType: assignment.assignmentType
      },
      summary: {
        totalStudents: studentsWithStatus.length,
        turnedIn: turnedIn.length,
        notSubmitted: notSubmitted.length,
        graded: turnedIn.filter(s => s.grade !== null && s.grade !== undefined).length
      },
      students: studentsWithStatus
    });
  } catch (error) {
    console.error("Error fetching assignment submissions:", error);
    res.status(500).json({ msg: "Server error" });
  }
};
