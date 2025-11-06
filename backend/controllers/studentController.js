import User from '../models/User.js';
import ClassModel from '../models/Class.js';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js'; 
import ContentModule from '../models/ContentModule.js'; 
import Material from '../models/Material.js';         
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js'; // You'll need to create this model


export const getAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    const assignment = await Assignment.findById(assessmentId);
    
    if (!assignment) {
      return res.status(404).json({ msg: 'Assessment not found' });
    }

    res.status(200).json(assignment);

  } catch (error) {
    console.error("Error fetching assessment:", error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Get student's submission for an assessment
// @route   GET /student/assessment/:assessmentId/submission
// @access  Private (for students)
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

// @desc    Submit an assessment (quiz or text assignment)
// @route   POST /student/assessment/:assessmentId/submit
// @access  Private (for students)
export const submitAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const userId = req.user._id;
    const { answers, textSubmission } = req.body;

    // Find the assignment
    const assignment = await Assignment.findById(assessmentId);
    if (!assignment) {
      return res.status(404).json({ msg: 'Assessment not found' });
    }

    // Check if already submitted
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

    // Handle quiz submission (auto-grade)
    if (answers && assignment.questions && assignment.questions.length > 0) {
      let score = 0;
      const totalScore = assignment.questions.length;

      assignment.questions.forEach((question, index) => {
        if (answers[index] === question.correctAnswer) {
          score++;
        }
      });

      submissionData.answers = answers;
      submissionData.score = score;
      submissionData.totalScore = totalScore;
      submissionData.grade = Math.round((score / totalScore) * 100);
    }

    // Handle text assignment submission (needs manual grading)
    if (textSubmission) {
      submissionData.textSubmission = textSubmission;
      // Grade and feedback will be added by teacher later
    }

    const submission = await Submission.create(submissionData);

    res.status(201).json({ 
      success: true, 
      msg: 'Assessment submitted successfully',
      submission 
    });

  } catch (error) {
    console.error("Error submitting assessment:", error);
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
export const getAllClasses = async (req, res) => {
  try {
    const classes = await ClassModel.find({})
      .populate({
        path: 'teacher',
        model: 'Teacher',
        populate: {
          path: 'userId',
          model: 'User',
          select: 'name'
        }
      })
      .select('name description enrollmentCode teacher');
    const formattedClasses = classes.map(klass => {
      return {
        _id: klass._id,
        name: klass.name,
        description: klass.description,
        enrollmentCode: klass.enrollmentCode,
        teacherName: klass.teacher?.userId?.name || 'Instructor'
      };
    });
    res.status(200).json(formattedClasses);
  } catch (error) {
    console.error("Error fetching all classes:", error);
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
      .select('name description teacher');

    if (!klass) {
      return res.status(404).json({ msg: 'Class not found' });
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