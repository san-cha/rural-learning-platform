import User from '../models/User.js';
import ClassModel from '../models/Class.js';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js'; 
import ContentModule from '../models/ContentModule.js'; 
import Material from '../models/Material.js';         
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js'; // Add this import at the top

/**
 * Get content metadata for student view page (SECURE - strips quiz answers)
 * This is for the "Turn In" page where students view assignment details
 * GET /student/content/:id
 */
export const getContentMetadata = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find the student to verify enrollment
    const student = await Student.findOne({ userId: userId });
    if (!student) {
      return res.status(404).json({ msg: 'Student profile not found' });
    }

    // Try to find as Assignment first, then as Material
    let content = await Assignment.findById(id).lean();
    let contentType = 'assignment';

    if (!content) {
      content = await Material.findById(id).lean();
      contentType = 'material';
    }

    if (!content) {
      return res.status(404).json({ msg: 'Content not found' });
    }

    // Verify student is enrolled in the class
    const isEnrolled = student.enrolledClasses.some(
      classId => classId.toString() === content.classId.toString()
    );

    if (!isEnrolled) {
      return res.status(403).json({ msg: 'You are not enrolled in this class' });
    }

    // SECURITY: Strip out quiz answers if this is a quiz assignment
    if (contentType === 'assignment' && content.assignmentType === 'manual-quiz') {
      // Remove the correctAnswer field from each question
      if (content.quizData && content.quizData.questions) {
        content.quizData.questions = content.quizData.questions.map(q => ({
          question: q.question,
          options: q.options,
          // correctAnswer is intentionally omitted
        }));
      }
    }

    // Check if student has already submitted
    let submission = null;
    if (contentType === 'assignment') {
      submission = await Submission.findOne({
        assignmentId: id,
        studentId: userId
      }).lean();
    }

    res.status(200).json({
      content: {
        ...content,
        contentType,
      },
      submission,
    });
  } catch (error) {
    console.error("Error fetching content metadata:", error);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * Get assessment for quiz start page (includes questions for taking quiz)
 * This is ONLY for the quiz-taking page, not the view page
 * GET /student/assessment/:assessmentId
 */
export const getAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const userId = req.user._id;

    // Find the student to verify enrollment
    const student = await Student.findOne({ userId: userId });
    if (!student) {
      return res.status(404).json({ msg: 'Student profile not found' });
    }

    const assignment = await Assignment.findById(assessmentId);
    
    if (!assignment) {
      return res.status(404).json({ msg: 'Assessment not found' });
    }

    // Verify student is enrolled in the class
    const isEnrolled = student.enrolledClasses.some(
      classId => classId.toString() === assignment.classId.toString()
    );

    if (!isEnrolled) {
      return res.status(403).json({ msg: 'You are not enrolled in this class' });
    }

    // Return full assignment including quizData for taking the quiz
    res.status(200).json(assignment);
  } catch (error) {
    console.error("Error fetching assessment:", error);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const getSubmission = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const userId = req.user._id;

    const submission = await Submission.findOne({
      assignmentId: assessmentId,
      studentId: userId
    });

    if (!submission) {
      return res.status(404).json({ msg: 'No submission found' });
    }
    res.status(200).json({ submission });
  } catch (error) {
    console.error("Error fetching submission:", error);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const submitAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const userId = req.user._id;
    const { answers, textSubmission } = req.body;

    const assignment = await Assignment.findById(assessmentId);
    if (!assignment) {
      return res.status(404).json({ msg: 'Assessment not found' });
    }

    const existingSubmission = await Submission.findOne({
      assignmentId: assessmentId,
      studentId: userId
    });

    if (existingSubmission) {
      return res.status(400).json({ msg: 'You have already submitted this assessment' });
    }

    let submissionData = {
      assignmentId: assessmentId,
      studentId: userId,
      submittedAt: new Date()
    };

    // Handle file assignment submissions (Cloudinary upload)
    if (assignment.assignmentType === 'file' && req.file) {
      // req.file.path contains the Cloudinary URL
      submissionData.textSubmission = req.file.path; // Store Cloudinary URL in textSubmission field
    }

    // Handle quiz submissions - Auto-grade
    if (assignment.assignmentType === 'manual-quiz' && answers) {
      // Parse answers if it's a string (from FormData)
      let parsedAnswers = answers;
      if (typeof answers === 'string') {
        try {
          parsedAnswers = JSON.parse(answers);
        } catch (e) {
          console.error("Error parsing answers:", e);
          parsedAnswers = [];
        }
      }

      if (assignment.quizData && assignment.quizData.questions && assignment.quizData.questions.length > 0) {
        let score = 0;
        const totalScore = assignment.quizData.questions.length;

        assignment.quizData.questions.forEach((question, index) => {
          if (parsedAnswers[index] === question.correctAnswer) {
            score++;
          }
        });

        submissionData.answers = parsedAnswers;
        submissionData.score = score;
        submissionData.totalScore = totalScore;
        submissionData.grade = Math.round((score / totalScore) * 100);
      }
    }

    // Handle text submissions (legacy support)
    if (textSubmission && !req.file) {
      submissionData.textSubmission = textSubmission;
    }

    const submission = await Submission.create(submissionData);
    res.status(201).json({ success: true, msg: 'Assessment submitted successfully', submission });
  } catch (error) {
    console.error("Error submitting assessment:", error);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * Unsubmit an assessment (Google Classroom style)
 * DELETE /student/assessment/:assessmentId/unsubmit
 */
export const unsubmitAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const userId = req.user._id;

    // Find the submission
    const submission = await Submission.findOne({
      assignmentId: assessmentId,
      studentId: userId
    });

    if (!submission) {
      return res.status(404).json({ msg: 'No submission found' });
    }

    // Check if already graded - don't allow unsubmit if graded
    if (submission.grade !== null && submission.grade !== undefined && submission.gradedAt) {
      return res.status(400).json({ msg: 'Cannot unsubmit a graded assignment' });
    }

    // Delete the submission
    await Submission.findByIdAndDelete(submission._id);

    res.status(200).json({ success: true, msg: 'Submission withdrawn successfully' });
  } catch (error) {
    console.error("Error unsubmitting assessment:", error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Set/Update student's grade
// @route   PUT /student/set-grade
// @access  Private (for students)
export const setGrade = async (req, res) => {
  try {
    const { grade } = req.body;
    if (!grade || typeof grade !== 'number') {
      return res.status(400).json({ msg: 'A valid grade is required' });
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    if (user.role !== 'student') {
      return res.status(403).json({ msg: 'Only students can set a grade' });
    }
    user.grade = grade;
    await user.save();
    const updatedUser = await User.findById(req.user._id).select('-password');
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Get all available classes for enrollment
// @route   GET /student/all-classes
// @access  Private (for students)
// @query   Optional: gradeLevel - filter by grade level
export const getAllClasses = async (req, res) => {
  try {
    const { gradeLevel } = req.query;
    
    // Build query - exclude classes the student is already enrolled in
    const student = await Student.findOne({ userId: req.user._id });
    const enrolledClassIds = student?.enrolledClasses || [];
    
    let query = { _id: { $nin: enrolledClassIds } };
    
    // Filter by gradeLevel if provided
    if (gradeLevel) {
      query.gradeLevel = gradeLevel;
    }
    
    const classes = await ClassModel.find(query)
      .populate({
        path: 'teacher',
        model: 'Teacher',
        populate: {
          path: 'userId',
          model: 'User',
          select: 'name'
        }
      })
      .select('name description enrollmentCode teacher gradeLevel');
      
    const formattedClasses = classes.map(klass => {
      return {
        _id: klass._id,
        name: klass.name,
        description: klass.description,
        enrollmentCode: klass.enrollmentCode,
        gradeLevel: klass.gradeLevel,
        teacherName: klass.teacher?.userId?.name || 'Instructor'
      };
    });
    res.status(200).json(formattedClasses);
  } catch (error) {
    console.error("Error fetching all classes:", error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Get classes by grade level (for discovery, excluding enrolled classes)
// @route   GET /student/classes-by-grade?gradeLevel=Grade 5
// @access  Private (for students)
export const getClassesByGradeLevel = async (req, res) => {
  try {
    const { gradeLevel } = req.query;
    
    if (!gradeLevel) {
      return res.status(400).json({ msg: "Grade level is required" });
    }
    
    // Validate gradeLevel
    const validGradeLevels = [
      "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
      "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10",
      "Grade 11", "Grade 12", "College"
    ];
    if (!validGradeLevels.includes(gradeLevel)) {
      return res.status(400).json({ msg: "Invalid grade level" });
    }
    
    // Find student to get enrolled classes
    const student = await Student.findOne({ userId: req.user._id });
    const enrolledClassIds = student?.enrolledClasses || [];
    
    // Find classes matching gradeLevel that student is NOT enrolled in
    const classes = await ClassModel.find({
      gradeLevel: gradeLevel,
      _id: { $nin: enrolledClassIds }
    })
      .populate({
        path: 'teacher',
        model: 'Teacher',
        populate: {
          path: 'userId',
          model: 'User',
          select: 'name'
        }
      })
      .select('name description enrollmentCode teacher gradeLevel');
    
    const formattedClasses = classes.map(klass => {
      return {
        _id: klass._id,
        name: klass.name,
        description: klass.description,
        enrollmentCode: klass.enrollmentCode,
        gradeLevel: klass.gradeLevel,
        teacherName: klass.teacher?.userId?.name || 'Instructor'
      };
    });
    
    res.status(200).json({ classes: formattedClasses, gradeLevel });
  } catch (error) {
    console.error("Error fetching classes by grade level:", error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Get all content for a single class (materials and assignments)
// @route   GET /student/class/:classId/content
// @access  Private (for students)
export const getClassContent = async (req, res) => {
  try {
    const { classId } = req.params;
    const userId = req.user._id;

    // Find the student to get their completed list
    const student = await Student.findOne({ userId: userId });
    const completedMaterials = student ? student.completedMaterials : [];

    // Find the class
    const klass = await ClassModel.findById(classId)
      .populate({
        path: 'teacher',
        model: 'Teacher',
        populate: { path: 'userId', model: 'User', select: 'name' }
      })
      .select('name description teacher gradeLevel');

    if (!klass) {
      return res.status(404).json({ msg: 'Class not found' });
    }

    // Verify student is enrolled in this class
    if (!student || !student.enrolledClasses.some(id => id.toString() === classId)) {
      return res.status(403).json({ msg: 'You are not enrolled in this class' });
    }

    // Fetch materials and assignments in parallel
    const [materials, assignments] = await Promise.all([
      Material.find({ classId: classId }).lean(), 
      Assignment.find({ classId: classId }).lean() 
    ]);

    // Combine and format all content
    const allContent = [
      ...materials.map(m => ({
        ...m,
        type: m.type || 'reading',
        contentType: 'material'
      })),
      ...assignments.map(a => ({
        ...a,
        type: a.assignmentType || 'assignment',
        contentType: 'assignment'
      }))
    ];

    // Add completion status and sort by title
    const processedContent = allContent
      .map(item => ({
        ...item,
        isCompleted: completedMaterials.some(completedId => 
          completedId.toString() === item._id.toString()
        )
      }))
      .sort((a, b) => {
        // Sort by order if available, otherwise by title
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        return (a.title || '').localeCompare(b.title || '');
      });

    // Send clean response
    res.status(200).json({
      classDetails: {
        _id: klass._id,
        name: klass.name,
        description: klass.description,
        gradeLevel: klass.gradeLevel,
        teacherName: klass.teacher?.userId?.name || 'Instructor',
      },
      content: processedContent // Single array with all content
    });

  } catch (error) {
    console.error("Error fetching class content:", error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Mark a material/assignment as completed
// @route   POST /student/material/:materialId/complete
// @access  Private (for students)
export const markMaterialComplete = async (req, res) => {
  try {
    const { materialId } = req.params;
    const userId = req.user._id;

    // Add to completed materials (won't duplicate due to $addToSet)
    await Student.updateOne(
      { userId: userId },
      { $addToSet: { completedMaterials: materialId } }
    );

    res.status(200).json({ success: true, msg: 'Material marked as complete.' });

  } catch (error) {
    console.error("Error marking material complete:", error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Get dashboard overview for student (based on enrolled classes only)
// @route   GET /student/dashboard
// @access  Private (for students)
export const getDashboardOverview = async (req, res) => {
  try {
    // Find the Student profile using req.user._id
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ msg: "Student profile not found" });
    }

    // Retrieve all Classes the student is enrolled in
    const studentClasses = await ClassModel.find({ 
      _id: { $in: student.enrolledClasses } 
    })
      .populate('teacher', 'userId')
      .populate('enrolledStudents')
      .select('name description gradeLevel teacher enrolledStudents');

    const studentClassIds = studentClasses.map(klass => klass._id);

    // Retrieve all Assignments relevant to these classes
    const assignments = await Assignment.find({ 
      classId: { $in: studentClassIds } 
    }).lean();

    // Get all submissions for this student
    const submissions = await Submission.find({ 
      studentId: req.user._id,
      assignmentId: { $in: assignments.map(a => a._id) }
    }).lean();

    // Calculate Metrics
    const assignmentIds = assignments.map(a => a._id.toString());
    const submittedAssignmentIds = new Set(submissions.map(s => s.assignmentId.toString()));
    
    // Pending Assignments: Count assignments where student has not submitted, or submission is not yet graded
    const pendingAssignments = assignments.filter(assignment => {
      const submission = submissions.find(s => s.assignmentId.toString() === assignment._id.toString());
      return !submission || submission.grade === null || submission.grade === undefined;
    });

    // Assignments Due Soon: Filter assignments by dueDate (within 7 days)
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const assignmentsDueSoon = assignments.filter(assignment => {
      if (!assignment.dueDate) return false;
      const dueDate = new Date(assignment.dueDate);
      return dueDate >= now && dueDate <= sevenDaysFromNow;
    });

    // Overall Progress/Grades: Summarize grades from submissions
    const gradedSubmissions = submissions.filter(s => s.grade !== null && s.grade !== undefined);
    const totalAssignments = assignments.length;
    const completedAssignments = gradedSubmissions.length;
    const overallProgress = totalAssignments > 0 
      ? Math.round((completedAssignments / totalAssignments) * 100) 
      : 0;
    
    // Calculate average grade
    const averageGrade = gradedSubmissions.length > 0
      ? Math.round(gradedSubmissions.reduce((sum, s) => sum + (s.grade || 0), 0) / gradedSubmissions.length)
      : 0;

    // Return active classes with gradeLevel and metrics
    const activeClasses = studentClasses.map(klass => ({
      _id: klass._id,
      name: klass.name,
      description: klass.description,
      gradeLevel: klass.gradeLevel,
      studentCount: klass.enrolledStudents?.length || 0,
    }));

    res.json({
      pendingAssignments: pendingAssignments.length,
      assignmentsDueSoon: assignmentsDueSoon.length,
      overallProgress,
      averageGrade,
      totalAssignments,
      completedAssignments,
      activeClasses,
      assignments: assignments.slice(0, 5).map(a => ({
        _id: a._id,
        title: a.title,
        dueDate: a.dueDate,
        classId: a.classId
      }))
    });
  } catch (error) {
    console.error("Error fetching student dashboard overview:", error);
    res.status(500).json({ msg: "Server error" });
  }
};
