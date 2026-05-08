import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true },
    steps: { type: Number, default: 0 },
    weightKg: { type: Number },
    glucoseMgDl: { type: Number },
    waterL: { type: Number },
    notes: { type: String },
  },
  { timestamps: true }
);

// One entry per user per date
activitySchema.index({ userId: 1, date: 1 }, { unique: true });

export const Activity = mongoose.model("Activity", activitySchema);
