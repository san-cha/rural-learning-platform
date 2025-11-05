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

