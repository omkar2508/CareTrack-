import mongoose from "mongoose";

const riskSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    level: { type: String, enum: ["low", "medium", "high"], required: true },
    reason: { type: String },
    insights: [
      {
        id: String,
        title: String,
        description: String,
        tone: { type: String, enum: ["info", "warning", "danger", "success"] },
      },
    ],
    calculatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Risk = mongoose.model("Risk", riskSchema);
