// backend/middleware/roleMiddleware.js

// Middleware to check if user is a student
export const student = (req, res, next) => {
  if (req.user && req.user.role === 'student') {
    next();
  } else {
    res.status(403).json({ msg: "Access denied. Students only." });
  }
};

// Optional: Add teacher role check here too for consistency
export const teacher = (req, res, next) => {
  if (req.user && req.user.role === 'teacher') {
    next();
  } else {
    res.status(403).json({ msg: "Access denied. Teachers only." });
  }
};

// Optional: Add admin role check
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ msg: "Access denied. Admins only." });
  }
};