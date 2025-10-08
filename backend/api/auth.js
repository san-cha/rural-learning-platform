// backend/routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js"; // Import the database model

const router = express.Router();

// ## REGISTER ROUTE ##
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

    // Create new user (password will be hashed automatically by the model)
    user = new User({ name, email, phone, dob, role, password });
    await user.save();
    
    res.status(201).json({ msg: "User registered successfully!" });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// ## LOGIN ROUTE ##
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

    // Compare submitted password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }
    
    // Create and return a JSON Web Token (JWT) for authentication
    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "5h" });

    res.json({ token });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

export default router;