import express from "express";
const router = express.Router();
router.post("/register", (req, res) => {
  const { name, email, phone, dob, role, password, confirmPassword } = req.body;

  // Simple validation
  if (!name || !email || !phone || !dob || !role || !password || !confirmPassword) {
    return res.status(400).json({ msg: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ msg: "Passwords do not match" });
  }

  if (users.find(u => u.email === email)) {
    return res.status(400).json({ msg: "User already exists" });
  }

  const newUser = { id: Date.now(), name, email, phone, dob, role, password };
  users.push(newUser);
  console.log("Current users:", users);

  return res.status(201).json({ token: "mock-token-123" });
});

export { router }; // <-- named export
