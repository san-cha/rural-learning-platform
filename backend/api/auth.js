import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

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
  const { name, email, phone, dob, role, password, confirmPassword } = req.body;

  if (!name || !email || !phone || !dob || !role || !password) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ msg: "Passwords do not match" });
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

    res.status(201).json({ msg: "User registered successfully!", user: { id: user._id, name, email, role } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = createToken(user);

    res.cookie("token", token, COOKIE_OPTIONS);

    res.json({ msg: "Logged in successfully", user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.get("/me", (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ user: decoded.user });
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", COOKIE_OPTIONS);
  res.json({ msg: "Logged out successfully" });
});

export default router;