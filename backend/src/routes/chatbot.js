import express from "express";
import { protect } from "../middleware/auth.js";
import { Report } from "../models/Report.js";
import { Activity } from "../models/Activity.js";

const router = express.Router();

// POST /api/chatbot
router.post("/", protect, async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: "Message is required." });

    // Fetch patient context
    const [reports, activities] = await Promise.all([
      Report.find({ userId: req.user._id }).sort({ date: -1 }).limit(5),
      Activity.find({ userId: req.user._id }).sort({ date: -1 }).limit(14),
    ]);

    const avgSteps =
      activities.length > 0
        ? Math.round(activities.reduce((a, d) => a + (d.steps || 0), 0) / activities.length)
        : "no data";

    const latestReport = reports[0];
    const latestActivity = activities[0];

    const systemPrompt = `You are a friendly and knowledgeable health assistant for the CareTrack patient monitoring app.

PATIENT PROFILE:
- Name: ${req.user.name}
- Age: ${req.user.age ?? "not set"}
- Gender: ${req.user.gender ?? "not set"}
- Condition: ${req.user.condition ?? "General"}
- Height: ${req.user.heightCm ? req.user.heightCm + " cm" : "not set"}

LATEST LAB REPORT (${latestReport?.date ?? "none"}):
- HbA1c: ${latestReport?.hba1c ?? "N/A"}%
- Fasting Glucose: ${latestReport?.fastingGlucose ?? "N/A"} mg/dL
- Cholesterol: ${latestReport?.cholesterol ?? "N/A"} mg/dL

RECENT ACTIVITY (last 14 days):
- Average steps/day: ${avgSteps}
- Latest weight: ${latestActivity?.weightKg ?? "N/A"} kg
- Latest glucose reading: ${latestActivity?.glucoseMgDl ?? "N/A"} mg/dL
- Latest water intake: ${latestActivity?.waterL ?? "N/A"} L

RULES:
1. Give personalized, empathetic, practical advice based on THEIR actual data above.
2. Keep responses concise (2–4 sentences max).
3. Use simple, non-medical language patients can understand.
4. If risk seems high, always recommend consulting a doctor.
5. Never diagnose conditions — only guide and educate.
6. Do not make up data not provided above.`;

    // Build message history for Claude
    const messages = [
      ...history.slice(-6).map((h) => ({ role: h.role, content: h.content })),
      { role: "user", content: message },
    ];

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        system: systemPrompt,
        messages,
      }),
    });

    if (!anthropicRes.ok) {
      // Fallback to rule-based if API key not set
      const reply = getRuleBasedReply(message, latestReport, avgSteps, req.user);
      return res.json({ reply });
    }

    const data = await anthropicRes.json();
    const reply = data.content?.[0]?.text ?? "Sorry, I couldn't generate a response.";
    res.json({ reply });
  } catch (err) {
    console.error("Chatbot error:", err);
    res.status(500).json({ message: "Chatbot error. Please try again." });
  }
});

function getRuleBasedReply(q, report, avgSteps, user) {
  const lower = q.toLowerCase();
  if (lower.includes("sugar") || lower.includes("glucose")) {
    const g = report?.fastingGlucose;
    return g
      ? `Your latest fasting glucose is ${g} mg/dL. ${g >= 140 ? "This is elevated — try reducing simple carbs and increasing activity." : "This is in an acceptable range. Keep monitoring daily."}`
      : "I don't have recent glucose data. Please upload a lab report or log your daily glucose.";
  }
  if (lower.includes("steps") || lower.includes("activity") || lower.includes("walk")) {
    return avgSteps === "no data"
      ? "No activity data found. Start logging your daily steps to get personalised tips."
      : `Your average is ${avgSteps.toLocaleString()} steps/day. ${avgSteps < 5000 ? "Try a 20-minute walk after meals to boost this." : "Great job staying active!"}`;
  }
  if (lower.includes("doctor") || lower.includes("visit")) {
    return "If you are experiencing worsening symptoms, high glucose readings, or feel unwell, please consult your doctor promptly.";
  }
  if (lower.includes("hba1c")) {
    const h = report?.hba1c;
    return h
      ? `Your HbA1c is ${h}%. ${h >= 7 ? "Above 7% indicates glucose has been running high. Talk to your doctor about adjusting your management plan." : "This is within a good range — keep it up."}`
      : "No HbA1c data available. Please upload your latest lab report.";
  }
  return `Hello ${user.name.split(" ")[0]}! I can help you with questions about your sugar levels, HbA1c, activity, weight, and when to see a doctor. What would you like to know?`;
}

export default router;
