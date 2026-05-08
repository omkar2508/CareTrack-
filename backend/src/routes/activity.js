import express from "express";
import { protect } from "../middleware/auth.js";
import { Activity } from "../models/Activity.js";

const router = express.Router();

// GET /api/activity  — last N days
router.get("/", protect, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 14;
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceStr = since.toISOString().slice(0, 10);

    const entries = await Activity.find({
      userId: req.user._id,
      date: { $gte: sinceStr },
    }).sort({ date: 1 });

    res.json({ entries });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch activity." });
  }
});

// POST /api/activity  — upsert today's entry
router.post("/", protect, async (req, res) => {
  try {
    const { date, steps, weightKg, glucoseMgDl, waterL, notes } = req.body;
    if (!date) return res.status(400).json({ message: "Date is required." });

    const entry = await Activity.findOneAndUpdate(
      { userId: req.user._id, date },
      { steps, weightKg, glucoseMgDl, waterL, notes },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(201).json({ message: "Activity logged.", entry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save activity." });
  }
});

export default router;
