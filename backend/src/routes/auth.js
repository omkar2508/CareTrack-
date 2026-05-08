import express from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    if (!name || !email || !password || !confirmPassword)
      return res.status(400).json({ message: "All fields are required." });
    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match." });
    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters." });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email is already registered." });

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      message: "Account created successfully.",
      token,
      user: { id: user._id, name: user.name, email: user.email, isProfileComplete: user.isProfileComplete },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required." });

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: "Invalid email or password." });

    const token = generateToken(user._id);
    res.json({
      message: "Login successful.",
      token,
      user: { id: user._id, name: user.name, email: user.email, isProfileComplete: user.isProfileComplete },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

// GET /api/auth/me
router.get("/me", protect, async (req, res) => {
  const u = req.user;
  res.json({
    user: {
      id: u._id, name: u.name, email: u.email, age: u.age,
      gender: u.gender, condition: u.condition, heightCm: u.heightCm,
      isProfileComplete: u.isProfileComplete,
    },
  });
});

// PUT /api/auth/profile
router.put("/profile", protect, async (req, res) => {
  try {
    const { age, gender, condition, heightCm } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { age, gender, condition, heightCm, isProfileComplete: true },
      { new: true, runValidators: true }
    );
    res.json({
      message: "Profile updated successfully.",
      user: {
        id: user._id, name: user.name, email: user.email, age: user.age,
        gender: user.gender, condition: user.condition, heightCm: user.heightCm,
        isProfileComplete: user.isProfileComplete,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

export default router;
