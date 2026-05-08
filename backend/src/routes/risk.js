import express from "express";
import { protect } from "../middleware/auth.js";
import { Report } from "../models/Report.js";
import { Activity } from "../models/Activity.js";

const router = express.Router();

// Rule-based risk engine
function calculateRisk(reports, activities, user) {
  const insights = [];
  let score = 0;

  const latestReport = reports[0]; // sorted desc
  const avgSteps =
    activities.length > 0
      ? Math.round(activities.reduce((a, d) => a + (d.steps || 0), 0) / activities.length)
      : null;

  // --- HbA1c rules ---
  if (latestReport?.hba1c) {
    if (latestReport.hba1c >= 8) {
      score += 3;
      insights.push({ id: "hba1c-high", title: "HbA1c is critically high", description: `Your HbA1c is ${latestReport.hba1c}% — above 8% indicates poor long-term glucose control.`, tone: "danger" });
    } else if (latestReport.hba1c >= 7) {
      score += 2;
      insights.push({ id: "hba1c-warn", title: "HbA1c above target", description: `Your HbA1c is ${latestReport.hba1c}%. Target is below 7% for most diabetic patients.`, tone: "warning" });
    } else {
      insights.push({ id: "hba1c-ok", title: "HbA1c is in range", description: `Your HbA1c is ${latestReport.hba1c}% — within a healthy range. Keep it up.`, tone: "success" });
    }
  }

  // --- Fasting glucose rules ---
  if (latestReport?.fastingGlucose) {
    if (latestReport.fastingGlucose >= 180) {
      score += 3;
      insights.push({ id: "gluc-high", title: "Fasting glucose very high", description: `Fasting glucose: ${latestReport.fastingGlucose} mg/dL. Readings above 180 need medical attention.`, tone: "danger" });
    } else if (latestReport.fastingGlucose >= 140) {
      score += 2;
      insights.push({ id: "gluc-warn", title: "Elevated fasting glucose", description: `Fasting glucose: ${latestReport.fastingGlucose} mg/dL. Normal fasting is below 100 mg/dL.`, tone: "warning" });
    } else if (latestReport.fastingGlucose >= 100) {
      score += 1;
      insights.push({ id: "gluc-pre", title: "Pre-diabetic glucose range", description: `Fasting glucose: ${latestReport.fastingGlucose} mg/dL. This is in the pre-diabetic range (100–139).`, tone: "warning" });
    }
  }

  // --- Steps rules ---
  if (avgSteps !== null) {
    if (avgSteps < 3000) {
      score += 2;
      insights.push({ id: "steps-low", title: "Activity is very low", description: `Average ${avgSteps.toLocaleString()} steps/day. Very low activity worsens insulin resistance.`, tone: "danger" });
    } else if (avgSteps < 6000) {
      score += 1;
      insights.push({ id: "steps-warn", title: "Activity below target", description: `Average ${avgSteps.toLocaleString()} steps/day. Aim for 7,000+ daily steps.`, tone: "warning" });
    } else {
      insights.push({ id: "steps-ok", title: "Good activity level", description: `Average ${avgSteps.toLocaleString()} steps/day. Great job staying active!`, tone: "success" });
    }
  }

  // --- Weight/BMI check ---
  const latestActivity = activities[activities.length - 1];
  if (latestActivity?.weightKg && user?.heightCm) {
    const bmi = latestActivity.weightKg / Math.pow(user.heightCm / 100, 2);
    if (bmi >= 35) {
      score += 2;
      insights.push({ id: "bmi-high", title: "BMI indicates obesity", description: `BMI ${bmi.toFixed(1)} — class II obesity significantly increases diabetes complications.`, tone: "danger" });
    } else if (bmi >= 30) {
      score += 1;
      insights.push({ id: "bmi-warn", title: "BMI indicates obesity", description: `BMI ${bmi.toFixed(1)}. A 5–10% weight loss would meaningfully improve insulin sensitivity.`, tone: "warning" });
    } else if (bmi >= 25) {
      insights.push({ id: "bmi-over", title: "Slightly overweight", description: `BMI ${bmi.toFixed(1)}. Maintaining a healthy weight helps glucose control.`, tone: "info" });
    }
  }

  // --- Trending glucose check (daily logs) ---
  const glucoseReadings = activities.filter((a) => a.glucoseMgDl).map((a) => a.glucoseMgDl);
  if (glucoseReadings.length >= 5) {
    const first = glucoseReadings.slice(0, 3).reduce((a, v) => a + v, 0) / 3;
    const last = glucoseReadings.slice(-3).reduce((a, v) => a + v, 0) / 3;
    if (last - first > 15) {
      score += 1;
      insights.push({ id: "gluc-trend", title: "Glucose trending upward", description: `Daily glucose readings have risen by ~${Math.round(last - first)} mg/dL over recent days.`, tone: "warning" });
    }
  }

  // --- Determine level ---
  let level, reason;
  if (score >= 6) {
    level = "high";
    reason = "Multiple critical indicators detected — high HbA1c, elevated glucose, and low activity.";
  } else if (score >= 3) {
    level = "medium";
    reason = "Some health indicators are above target. Monitoring and lifestyle changes are recommended.";
  } else {
    level = "low";
    reason = "Your current health indicators are within acceptable ranges. Keep maintaining healthy habits.";
  }

  return { level, reason, insights, score };
}

// GET /api/risk  — calculate and return risk
router.get("/", protect, async (req, res) => {
  try {
    const [reports, activities] = await Promise.all([
      Report.find({ userId: req.user._id }).sort({ date: -1 }).limit(5),
      Activity.find({ userId: req.user._id }).sort({ date: 1 }).limit(30),
    ]);

    const result = calculateRisk(reports, activities, req.user);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to calculate risk." });
  }
});

export default router;
