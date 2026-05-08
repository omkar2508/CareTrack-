"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { riskApi } from "@/lib/api";
import { RiskBadge } from "@/components/RiskBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle, CheckCircle2, Info, Stethoscope,
  Loader2, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Insight { id: string; title: string; description: string; tone: string }
interface RiskData { level: "low" | "medium" | "high"; reason: string; insights: Insight[]; score?: number }

const toneMap: Record<string, { icon: typeof Info; cls: string }> = {
  info:    { icon: Info,          cls: "bg-primary-soft text-primary" },
  success: { icon: CheckCircle2,  cls: "bg-risk-low-soft text-risk-low" },
  warning: { icon: AlertTriangle, cls: "bg-risk-medium-soft text-risk-medium" },
  danger:  { icon: AlertTriangle, cls: "bg-risk-high-soft text-risk-high" },
};

const recommendations: Record<string, string[]> = {
  high: [
    "⚠️ Please consult your doctor within the next few days.",
    "Reduce refined sugar, white rice, and sugary drinks immediately.",
    "Aim for at least a 20-minute walk after each meal.",
    "Monitor fasting glucose daily and log it here.",
    "Drink at least 2.5 L of water daily.",
    "Avoid skipping meals — eat small, frequent meals.",
  ],
  medium: [
    "Schedule a routine follow-up with your physician in 4–6 weeks.",
    "Try to reach 7,000+ steps per day — start with short walks.",
    "Reduce simple carbs (white bread, sweets) at dinner.",
    "Log your glucose 2–3 times per week to track trends.",
    "Increase vegetable intake to half of every meal plate.",
    "Drink at least 2 L of water daily.",
  ],
  low: [
    "Great work! Keep maintaining your current healthy habits.",
    "Continue logging activity daily to stay on track.",
    "Aim for 7,000–10,000 steps per day.",
    "Schedule a routine lab checkup every 3 months.",
    "Maintain a balanced diet rich in fibre and protein.",
  ],
};

export default function RiskPage() {
  const { token } = useAuth();
  const [risk, setRisk] = useState<RiskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRisk = useCallback(async (silent = false) => {
    if (!token) return;
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const data = await riskApi.get(token);
      setRisk(data);
    } catch {
      toast.error("Failed to calculate risk.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => { fetchRisk(); }, [fetchRisk]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Calculating your risk…</p>
        </div>
      </div>
    );
  }

  if (!risk) return null;

  const recs = recommendations[risk.level] ?? recommendations.low;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Risk &amp; Insights</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Based on your latest reports and activity data</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <RiskBadge level={risk.level} />
          <button
            onClick={() => fetchRisk(true)}
            disabled={refreshing}
            className="p-2 rounded-lg border hover:bg-accent transition-colors text-muted-foreground"
            title="Recalculate"
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Risk reason card */}
      <Card className={cn("shadow-soft border-2", {
        "border-risk-high/30 bg-risk-high-soft/30": risk.level === "high",
        "border-risk-medium/30 bg-risk-medium-soft/30": risk.level === "medium",
        "border-risk-low/30 bg-risk-low-soft/30": risk.level === "low",
      })}>
        <CardContent className="p-6">
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-1">Why this risk level?</p>
          <p className="text-lg font-medium">{risk.reason}</p>
          {risk.score !== undefined && (
            <p className="text-sm text-muted-foreground mt-2">Risk score: {risk.score} / 10</p>
          )}
        </CardContent>
      </Card>

      {/* Insights */}
      {risk.insights.length > 0 ? (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Personal Insights
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {risk.insights.map((ins) => {
              const { icon: Icon, cls } = toneMap[ins.tone] ?? toneMap.info;
              return (
                <Card key={ins.id} className="shadow-soft">
                  <CardContent className="p-5 flex gap-4">
                    <div className={cn("h-10 w-10 rounded-xl grid place-items-center shrink-0", cls)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{ins.title}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{ins.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      ) : (
        <Card className="shadow-soft border-dashed">
          <CardContent className="p-8 text-center text-muted-foreground">
            <Info className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Not enough data for personalised insights yet.</p>
            <p className="text-xs mt-1">Add lab reports and daily activity to get detailed insights.</p>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-primary" /> Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <ul className="space-y-2">
            {recs.map((r, i) => (
              <li key={i} className={cn(
                "flex items-start gap-2 rounded-lg px-3 py-2",
                i === 0 && risk.level === "high" ? "bg-risk-high-soft text-risk-high font-medium" : "text-foreground/80"
              )}>
                <span className="mt-0.5 shrink-0">•</span>
                {r}
              </li>
            ))}
          </ul>
          <div className="pt-2 flex gap-3">
            <Link href="/chatbot"
              className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-accent transition-colors">
              Discuss with Care Assistant
            </Link>
            <Link href="/activity"
              className="px-4 py-2 rounded-lg bg-gradient-primary text-white text-sm font-medium hover:opacity-90 transition-opacity">
              Log today's activity
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
