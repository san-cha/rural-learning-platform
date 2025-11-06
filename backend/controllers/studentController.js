import User from '../models/User.js';
import ClassModel from '../models/Class.js';
import Teacher from '../models/Teacher.js';

// @desc    Get all available classes
// @route   GET /student/all-classes
// @access  Private (for students)
export const getAllClasses = async (req, res) => {
  try {
    // Find all classes
    const classes = await ClassModel.find({})
      // 1. Populate the 'teacher' field from the Class model (this is a ref to the 'Teacher' model)
      .populate({
        path: 'teacher',
        model: 'Teacher',
        // 2. Inside the 'Teacher' model, populate the 'userId' field (this is a ref to the 'User' model)
        populate: {
          path: 'userId',
          model: 'User',
          // 3. Only select the 'name' from the User model
          select: 'name'
        }
      })
      .select('name description enrollmentCode teacher'); // Only send the fields we need

    // Re-format the data to be cleaner for the frontend
    const formattedClasses = classes.map(klass => {
      return {
        _id: klass._id,
        name: klass.name,
        description: klass.description,
        enrollmentCode: klass.enrollmentCode,
        // Check if teacher and userId exist before trying to access the name
        teacherName: klass.teacher?.userId?.name || 'Instructor'
      };
    });

    res.status(200).json(formattedClasses);

  } catch (error) {
    console.error("Error fetching all classes:", error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Set/Update student's grade
// @route   PUT /api/student/set-grade
// @access  Private (for students)
export const setGrade = async (req, res) => {
  try {
    const { grade } = req.body;

    if (!grade || typeof grade !== 'number') {
      return res.status(400).json({ msg: 'A valid grade is required' });
    }

    // req.user._id is from your 'protect' middleware
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Ensure only students can set a grade
    if (user.role !== 'student') {
      return res.status(403).json({ msg: 'Only students can set a grade' });
    }

    // We are saving the grade on the USER model, not the Student model
    user.grade = grade;
    await user.save();

    // Send back the updated user profile (without password)
    const updatedUser = await User.findById(req.user._id).select('-password');
    res.status(200).json(updatedUser);

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
};