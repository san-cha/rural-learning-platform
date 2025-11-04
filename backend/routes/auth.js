import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";
import { protect } from '../middleware/authMiddleware.js'; 

const router = express.Router();
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
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

router.get("/me", protect, (req, res) => {
  res.json({ user: req.user });
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", COOKIE_OPTIONS);
  res.json({ msg: "Logged out successfully" });
});

export default router;