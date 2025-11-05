// backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

// 1. Middleware to check if user is logged in at all
export const protect = async (req, res, next) => {
  let token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ msg: "Not authorized, no token" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Get user from the token and attach it to the request object
    // We select('-password') to exclude the password
    req.user = await User.findById(decoded.user.id).select('-password');

    if (!req.user) {
        return res.status(401).json({ msg: "Not authorized, user not found" });
    }

    next(); // Move on to the next function
  } catch (err) {
    // !!! CHANGE THIS LINE !!!
    console.error("JWT Verification Failed:", err.message); 
    // !!! AND THIS LINE !!!
    res.status(401).json({ msg: "Token is not valid" });
  }
};

// 2. Middleware to check for a specific role
export const isTeacher = (req, res, next) => {
  if (req.user && req.user.role === 'teacher') {
    next();
  } else {
    res.status(403).json({ msg: "Not authorized as a teacher" });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ msg: "Not authorized as an admin" });
  }
};
