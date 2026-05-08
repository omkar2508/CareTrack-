import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import reportRoutes from "./routes/reports.js";
import activityRoutes from "./routes/activity.js";
import riskRoutes from "./routes/risk.js";
import chatbotRoutes from "./routes/chatbot.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? "https://yourdomain.com"
    : ["http://localhost:3000", "http://localhost:3001"],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use("/uploads", express.static("src/uploads"));

// Routes
app.get("/", (req, res) => res.json({ message: "CareTrack API is running 🏥", status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/risk", riskRoutes);
app.use("/api/chatbot", chatbotRoutes);

// 404
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Internal server error" });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 CareTrack backend running on http://localhost:${PORT}`);
  });
});
