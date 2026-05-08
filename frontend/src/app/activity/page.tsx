"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { activityApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  Bar, BarChart, CartesianGrid, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

interface Entry {
  _id?: string;
  date: string;
  steps: number;
  weightKg?: number;
  glucoseMgDl?: number;
  waterL?: number;
}

const today = () => new Date().toISOString().slice(0, 10);

export default function ActivityPage() {
  const { token } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ date: today(), steps: "", weightKg: "", glucoseMgDl: "", waterL: "" });

  const fetchEntries = useCallback(async () => {
    if (!token) return;
    try {
      const data = await activityApi.list(token, 14);
      setEntries(data.entries || []);
    } catch {
      toast.error("Failed to load activity data.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Record<string, string | number> = { date: form.date };
      if (form.steps) payload.steps = Number(form.steps);
      if (form.weightKg) payload.weightKg = Number(form.weightKg);
      if (form.glucoseMgDl) payload.glucoseMgDl = Number(form.glucoseMgDl);
      if (form.waterL) payload.waterL = Number(form.waterL);

      await activityApi.log(token!, payload);
      toast.success("Activity logged successfully!");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      fetchEntries();
    } catch (err: any) {
      toast.error(err.message || "Failed to save activity.");
    } finally {
      setSaving(false);
    }
  };

  const stepData = entries.map((d) => ({ date: d.date.slice(5), steps: d.steps }));
  const glucoseData = entries.filter((d) => d.glucoseMgDl).map((d) => ({ date: d.date.slice(5), glucose: d.glucoseMgDl }));
  const weightData = entries.filter((d) => d.weightKg).map((d) => ({ date: d.date.slice(5), weight: d.weightKg }));

  const fields = [
    { id: "steps",       label: "Steps",           placeholder: "e.g. 5200",  type: "number", step: "1" },
    { id: "weightKg",    label: "Weight (kg)",     placeholder: "e.g. 78.4",  type: "number", step: "0.1" },
    { id: "glucoseMgDl", label: "Glucose (mg/dL)", placeholder: "e.g. 130",   type: "number", step: "1" },
    { id: "waterL",      label: "Water (L)",       placeholder: "e.g. 2.0",   type: "number", step: "0.1" },
  ] as const;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Daily Activity</h1>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Log form */}
        <Card className="shadow-soft lg:col-span-1">
          <CardHeader><CardTitle className="text-base">Log Entry</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Date</label>
                <input type="date" value={form.date} onChange={set("date")} required
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>
              {fields.map(({ id, label, placeholder, type, step }) => (
                <div key={id} className="space-y-1.5">
                  <label className="text-sm font-medium">{label}</label>
                  <input
                    type={type} step={step} placeholder={placeholder}
                    value={form[id]}
                    onChange={set(id)}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground"
                  />
                </div>
              ))}
              <button type="submit" disabled={saving}
                className="w-full h-10 rounded-lg bg-gradient-primary text-white text-sm font-medium hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2 transition-opacity">
                {saving ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Saving…</>
                ) : saved ? (
                  <><CheckCircle2 className="h-4 w-4" />Saved!</>
                ) : "Save Entry"}
              </button>
            </form>
          </CardContent>
        </Card>

        {/* Charts col */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {stepData.length > 0 && (
                <Card className="shadow-soft">
                  <CardHeader className="pb-2"><CardTitle className="text-base">Steps — last 14 days</CardTitle></CardHeader>
                  <CardContent className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stepData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(150 20% 90%)" />
                        <XAxis dataKey="date" stroke="hsl(165 12% 45%)" fontSize={11} />
                        <YAxis stroke="hsl(165 12% 45%)" fontSize={11} />
                        <Tooltip contentStyle={{ background: "white", border: "1px solid hsl(150 20% 90%)", borderRadius: 8 }} />
                        <Bar dataKey="steps" fill="hsl(158 64% 42%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {glucoseData.length > 1 && (
                <Card className="shadow-soft">
                  <CardHeader className="pb-2"><CardTitle className="text-base">Daily Glucose</CardTitle></CardHeader>
                  <CardContent className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={glucoseData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(150 20% 90%)" />
                        <XAxis dataKey="date" stroke="hsl(165 12% 45%)" fontSize={11} />
                        <YAxis stroke="hsl(165 12% 45%)" fontSize={11} />
                        <Tooltip contentStyle={{ background: "white", border: "1px solid hsl(150 20% 90%)", borderRadius: 8 }} />
                        <Line type="monotone" dataKey="glucose" stroke="hsl(38 92% 50%)" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {weightData.length > 1 && (
                <Card className="shadow-soft">
                  <CardHeader className="pb-2"><CardTitle className="text-base">Weight trend</CardTitle></CardHeader>
                  <CardContent className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weightData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(150 20% 90%)" />
                        <XAxis dataKey="date" stroke="hsl(165 12% 45%)" fontSize={11} />
                        <YAxis stroke="hsl(165 12% 45%)" fontSize={11} domain={["dataMin - 2", "dataMax + 2"]} />
                        <Tooltip contentStyle={{ background: "white", border: "1px solid hsl(150 20% 90%)", borderRadius: 8 }} />
                        <Line type="monotone" dataKey="weight" stroke="hsl(220 70% 55%)" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {entries.length === 0 && (
                <div className="flex items-center justify-center h-48 border rounded-2xl border-dashed">
                  <p className="text-sm text-muted-foreground">Log your first entry to see charts here.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Recent entries table */}
      {entries.length > 0 && (
        <Card className="shadow-soft">
          <CardHeader><CardTitle className="text-base">Recent entries</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs uppercase tracking-wide">
                    <th className="text-left py-2 pr-4">Date</th>
                    <th className="text-left py-2 pr-4">Steps</th>
                    <th className="text-left py-2 pr-4">Weight</th>
                    <th className="text-left py-2 pr-4">Glucose</th>
                    <th className="text-left py-2">Water</th>
                  </tr>
                </thead>
                <tbody>
                  {[...entries].reverse().slice(0, 7).map((e) => (
                    <tr key={e._id ?? e.date} className="border-b last:border-0 hover:bg-accent/30 transition-colors">
                      <td className="py-2.5 pr-4 font-medium">{e.date}</td>
                      <td className="py-2.5 pr-4">{e.steps?.toLocaleString() ?? "—"}</td>
                      <td className="py-2.5 pr-4">{e.weightKg ? `${e.weightKg} kg` : "—"}</td>
                      <td className="py-2.5 pr-4">{e.glucoseMgDl ? `${e.glucoseMgDl} mg/dL` : "—"}</td>
                      <td className="py-2.5">{e.waterL ? `${e.waterL} L` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
