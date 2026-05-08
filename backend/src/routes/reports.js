import express from "express";
import multer from "multer";
import path from "path";
import { protect } from "../middleware/auth.js";
import { Report } from "../models/Report.js";

const router = express.Router();

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "src/uploads/"),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only PDF and image files are allowed."));
  },
});

// GET /api/reports
router.get("/", protect, async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user._id }).sort({ date: -1 });
    res.json({ reports });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reports." });
  }
});

// POST /api/reports  — upload + manual values
router.post("/", protect, upload.single("file"), async (req, res) => {
  try {
    const { date, hba1c, fastingGlucose, cholesterol, notes } = req.body;
    if (!date) return res.status(400).json({ message: "Date is required." });

    const report = await Report.create({
      userId: req.user._id,
      date,
      hba1c: hba1c ? Number(hba1c) : undefined,
      fastingGlucose: fastingGlucose ? Number(fastingGlucose) : undefined,
      cholesterol: cholesterol ? Number(cholesterol) : undefined,
      fileName: req.file?.originalname,
      filePath: req.file?.path,
      notes,
    });

    res.status(201).json({ message: "Report saved.", report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save report." });
  }
});

// DELETE /api/reports/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const report = await Report.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!report) return res.status(404).json({ message: "Report not found." });
    res.json({ message: "Report deleted." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete report." });
  }
});

export default router;
