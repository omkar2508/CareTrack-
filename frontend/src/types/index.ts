export type RiskLevel = "low" | "medium" | "high";

export interface DailyEntry {
  date: string;
  steps: number;
  weightKg: number;
  glucoseMgDl?: number;
  waterL?: number;
}

export interface LabReport {
  id: string;
  date: string;
  hba1c: number;
  fastingGlucose: number;
  cholesterol?: number;
  fileName: string;
}

export interface InsightItem {
  id: string;
  title: string;
  description: string;
  tone: "info" | "warning" | "danger" | "success";
}

export interface PatientData {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female";
  condition: string;
  heightCm: number;
  email: string;
  risk: RiskLevel;
  riskReason: string;
  reports: LabReport[];
  daily: DailyEntry[];
  insights: InsightItem[];
}
