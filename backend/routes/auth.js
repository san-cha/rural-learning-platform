import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Teacher from "../models/Teacher.js";
import Student from "../models/Student.js";
import ClassModel from "../models/Class.js";
import dotenv from "dotenv";
import { protect } from '../middleware/authMiddleware.js'; 

const router = express.Router();
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const COOKIE_OPTIONS = {
  httpOnly: true,
  // We use SameSite=None and secure=true for cross-site cookies, 
  // which is necessary when FE (5173) and BE (5000) are different.
  secure: true, 
  sameSite: "none", 
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const createToken = (user) => {
  const payload = { user: { id: user.id, role: user.role, name: user.name } };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "5h" });
};

router.post("/register", async (req, res) => {
  const { name, email, phone, dob, role, password } = req.body;

  if (!name || !email || !phone || !dob || !role || !password) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    user = new User({ name, email, phone, dob, role, password });
    await user.save();

    const token = createToken(user);
    res.cookie("token", token, COOKIE_OPTIONS);

    res.status(201).json({ success: true, msg: "User registered successfully!", user: { id: user._id, name, email, role } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.post("/login", async (req, res) => {
  const { loginIdentifier, password, role } = req.body;

  if (!loginIdentifier || !password || !role) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }

  try {
    const user = await User.findOne({
      $or: [{ email: loginIdentifier }, { phone: loginIdentifier }],
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Make sure user's role matches what's being logged in as
    if (user.role !== role) {
      return res.status(400).json({ msg: "Role does not match. Please check your login role." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = createToken(user);

    res.cookie("token", token, COOKIE_OPTIONS);

    res.json({
      msg: "Logged in successfully",
      success: true,
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", COOKIE_OPTIONS);
  res.json({ msg: "Logged out successfully" });
});

// Delete current user account and related records
router.delete("/delete-account", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (user.role === 'teacher') {
      const teacher = await Teacher.findOne({ userId: user._id });
      if (teacher) {
        // Delete classes owned by teacher
        await ClassModel.deleteMany({ teacher: teacher._id });
        await Teacher.deleteOne({ _id: teacher._id });
      }
    } else if (user.role === 'student') {
      const student = await Student.findOne({ userId: user._id });
      if (student) {
        // Remove student from enrolledStudents of classes
        await ClassModel.updateMany(
          { enrolledStudents: student._id },
          { $pull: { enrolledStudents: student._id } }
        );
        await Student.deleteOne({ _id: student._id });
      }
    }

    await User.deleteOne({ _id: user._id });
    res.clearCookie("token", COOKIE_OPTIONS);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ msg: "Server error" });
  }
});

// @desc    Get current user's profile
// @route   GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    // req.user._id is from your 'protect' middleware
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
});
router.get('/test', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Auth route is working!' });
});

export default router;