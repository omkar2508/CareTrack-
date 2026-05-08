import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true },
    hba1c: { type: Number },
    fastingGlucose: { type: Number },
    cholesterol: { type: Number },
    fileName: { type: String },
    filePath: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Report = mongoose.model("Report", reportSchema);
