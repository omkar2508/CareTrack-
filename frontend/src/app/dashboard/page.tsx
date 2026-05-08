"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { riskApi, reportsApi, activityApi } from "@/lib/api";
import { RiskBadge } from "@/components/RiskBadge";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity, Droplet, Footprints, HeartPulse, Scale,
  TrendingUp, AlertTriangle, CheckCircle2, Info, Loader2,
} from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { cn } from "@/lib/utils";

type RiskLevel = "low" | "medium" | "high";
interface Insight { id: string; title: string; description: string; tone: string }
interface RiskData { level: RiskLevel; reason: string; insights: Insight[] }
interface Report { date: string; hba1c?: number; fastingGlucose?: number; cholesterol?: number }
interface Entry { date: string; steps: number; weightKg?: number; glucoseMgDl?: number; waterL?: number }

function calcBMI(weight: number, heightCm: number) {
  return (weight / Math.pow(heightCm / 100, 2)).toFixed(1);
}

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [risk, setRisk] = useState<RiskData | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [noData, setNoData] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const [riskRes, reportRes, actRes] = await Promise.allSettled([
        riskApi.get(token),
        reportsApi.list(token),
        activityApi.list(token, 14),
      ]);

      if (riskRes.status === "fulfilled") setRisk(riskRes.value);
      if (reportRes.status === "fulfilled") setReports(reportRes.value.reports || []);
      if (actRes.status === "fulfilled") setEntries(actRes.value.entries || []);

      const hasReports = reportRes.status === "fulfilled" && reportRes.value.reports?.length > 0;
      const hasActivity = actRes.status === "fulfilled" && actRes.value.entries?.length > 0;
      setNoData(!hasReports && !hasActivity);
    } catch {
      setNoData(true);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const latestReport = reports[0];
  const latestEntry = entries[entries.length - 1];
  const avgSteps = entries.length
    ? Math.round(entries.reduce((a, d) => a + (d.steps || 0), 0) / entries.length)
    : null;
  const bmi = latestEntry?.weightKg && user?.heightCm
    ? calcBMI(latestEntry.weightKg, user.heightCm)
    : null;

  const glucoseSeries = entries
    .filter((d) => d.glucoseMgDl)
    .map((d) => ({ date: d.date.slice(5), glucose: d.glucoseMgDl }));
  const stepSeries = entries.map((d) => ({ date: d.date.slice(5), steps: d.steps }));

  const toneMap: Record<string, { icon: typeof Info; cls: string }> = {
    info:    { icon: Info,          cls: "bg-primary-soft text-primary" },
    success: { icon: CheckCircle2,  cls: "bg-risk-low-soft text-risk-low" },
    warning: { icon: AlertTriangle, cls: "bg-risk-medium-soft text-risk-medium" },
    danger:  { icon: AlertTriangle, cls: "bg-risk-high-soft text-risk-high" },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero welcome */}
      <section className="rounded-2xl bg-gradient-hero border p-6 md:p-8 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Welcome back</p>
            <h1 className="text-2xl md:text-3xl font-semibold mt-1">
              {user?.name?.split(" ")[0]}
            </h1>
            {user?.age && (
              <p className="text-muted-foreground mt-1">
                {user.age} yrs · {user.gender ?? "—"} · {user.condition ?? "General"}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {risk ? (
                <>
                  <RiskBadge level={risk.level} />
                  <p className="text-sm text-foreground/70 max-w-xl">{risk.reason}</p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Upload a report and log activity to see your risk level.</p>
              )}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link href="/activity" className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-accent transition-colors">
              Log today
            </Link>
            <Link href="/chatbot" className="px-4 py-2 rounded-lg bg-gradient-primary text-white text-sm font-medium hover:opacity-90 transition-opacity">
              Ask Care Assistant
            </Link>
          </div>
        </div>
      </section>

      {/* Empty state */}
      {noData && (
        <Card className="shadow-soft border-dashed">
          <CardContent className="p-8 text-center">
            <Activity className="h-10 w-10 text-primary mx-auto mb-3 opacity-60" />
            <p className="font-semibold text-lg">No data yet</p>
            <p className="text-sm text-muted-foreground mt-1 mb-5">
              Start by uploading a lab report or logging today's activity to see your health insights.
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/reports" className="px-4 py-2 rounded-lg bg-gradient-primary text-white text-sm font-medium hover:opacity-90">
                Upload report
              </Link>
              <Link href="/activity" className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-accent">
                Log activity
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stat cards */}
      {(latestReport || latestEntry) && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={HeartPulse}
            label="Latest HbA1c"
            value={latestReport?.hba1c ?? "—"}
            unit={latestReport?.hba1c ? "%" : ""}
            tone={latestReport?.hba1c ? (latestReport.hba1c >= 7 ? "warn" : "good") : "info"}
            hint={latestReport ? `Report: ${latestReport.date}` : "No report yet"}
          />
          <StatCard
            icon={Droplet}
            label="Fasting Glucose"
            value={latestReport?.fastingGlucose ?? "—"}
            unit={latestReport?.fastingGlucose ? "mg/dL" : ""}
            tone={
              latestReport?.fastingGlucose
                ? latestReport.fastingGlucose >= 140 ? "bad" : latestReport.fastingGlucose >= 110 ? "warn" : "good"
                : "info"
            }
          />
          <StatCard
            icon={Footprints}
            label="Avg Steps (14d)"
            value={avgSteps !== null ? avgSteps.toLocaleString() : "—"}
            tone={avgSteps !== null ? (avgSteps < 4000 ? "warn" : "good") : "info"}
            hint="Target: 7,000+"
          />
          <StatCard
            icon={Scale}
            label="BMI"
            value={bmi ?? "—"}
            tone={bmi ? (Number(bmi) >= 30 ? "bad" : Number(bmi) >= 25 ? "warn" : "good") : "info"}
            hint={latestEntry?.weightKg ? `${latestEntry.weightKg.toFixed(1)} kg` : "No weight logged"}
          />
        </section>
      )}

      {/* Charts */}
      {(stepSeries.length > 0 || glucoseSeries.length > 0) && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {glucoseSeries.length > 1 && (
            <Card className="shadow-soft">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Glucose trend</CardTitle>
                  <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5" /> last 14 days
                  </span>
                </div>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={glucoseSeries}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(158 64% 42%)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="hsl(158 64% 42%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(150 20% 90%)" />
                    <XAxis dataKey="date" stroke="hsl(165 12% 45%)" fontSize={11} />
                    <YAxis stroke="hsl(165 12% 45%)" fontSize={11} domain={["dataMin - 10", "dataMax + 10"]} />
                    <Tooltip contentStyle={{ background: "white", border: "1px solid hsl(150 20% 90%)", borderRadius: 8 }} />
                    <Area type="monotone" dataKey="glucose" stroke="hsl(158 64% 42%)" strokeWidth={2} fill="url(#g1)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {stepSeries.length > 1 && (
            <Card className="shadow-soft">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Daily steps</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stepSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(150 20% 90%)" />
                    <XAxis dataKey="date" stroke="hsl(165 12% 45%)" fontSize={11} />
                    <YAxis stroke="hsl(165 12% 45%)" fontSize={11} />
                    <Tooltip contentStyle={{ background: "white", border: "1px solid hsl(150 20% 90%)", borderRadius: 8 }} />
                    <Bar dataKey="steps" fill="hsl(158 64% 42%)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </section>
      )}

      {/* Insights */}
      {risk?.insights && risk.insights.length > 0 && (
        <section>
          <Card className="shadow-soft">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" /> Personal insights
              </CardTitle>
              <Link href="/risk" className="text-sm text-primary hover:underline">View all →</Link>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-3 gap-3">
              {risk.insights.slice(0, 3).map((ins) => {
                const { icon: Icon, cls } = toneMap[ins.tone] ?? toneMap.info;
                return (
                  <div key={ins.id} className="rounded-xl border p-4 bg-card flex gap-3">
                    <div className={cn("h-8 w-8 rounded-lg grid place-items-center shrink-0", cls)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{ins.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{ins.description}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
