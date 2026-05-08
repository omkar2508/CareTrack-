"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { reportsApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Upload, Trash2, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";

interface Report {
  _id: string;
  date: string;
  hba1c?: number;
  fastingGlucose?: number;
  cholesterol?: number;
  fileName?: string;
}

const initialForm = { date: "", hba1c: "", fastingGlucose: "", cholesterol: "", notes: "" };

export default function ReportsPage() {
  const { token } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const fetchReports = useCallback(async () => {
    if (!token) return;
    try {
      const data = await reportsApi.list(token);
      setReports(data.reports || []);
    } catch {
      toast.error("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date) { toast.error("Please select a date."); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (file) fd.append("file", file);
      await reportsApi.create(token!, fd);
      toast.success("Report saved successfully.");
      setForm(initialForm);
      setFile(null);
      setShowForm(false);
      fetchReports();
    } catch (err: any) {
      toast.error(err.message || "Failed to save report.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this report?")) return;
    try {
      await reportsApi.delete(token!, id);
      toast.success("Report deleted.");
      setReports((r) => r.filter((x) => x._id !== id));
    } catch {
      toast.error("Failed to delete.");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) { setFile(f); setShowForm(true); }
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Lab Reports</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "Add Report"}
        </button>
      </div>

      {/* Drop zone */}
      {!showForm && (
        <Card
          className={`shadow-soft border-dashed cursor-pointer transition-colors ${dragOver ? "bg-primary-soft border-primary" : "hover:bg-accent/30"}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => { setShowForm(true); fileRef.current?.click(); }}
        >
          <CardContent className="p-10 text-center">
            <div className="mx-auto h-12 w-12 rounded-xl bg-primary-soft text-primary grid place-items-center">
              <Upload className="h-5 w-5" />
            </div>
            <p className="mt-3 font-medium">Drag & drop your lab report</p>
            <p className="text-sm text-muted-foreground">PDF or image · Then fill in the values below</p>
          </CardContent>
        </Card>
      )}

      {/* Add report form */}
      {showForm && (
        <Card className="shadow-soft">
          <CardHeader><CardTitle className="text-base">Add Lab Report</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Report Date *</label>
                  <input type="date" required value={form.date} onChange={set("date")}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">HbA1c (%)</label>
                  <input type="number" step="0.1" placeholder="e.g. 7.2" value={form.hba1c} onChange={set("hba1c")}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Fasting Glucose (mg/dL)</label>
                  <input type="number" placeholder="e.g. 132" value={form.fastingGlucose} onChange={set("fastingGlucose")}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Cholesterol (mg/dL)</label>
                  <input type="number" placeholder="e.g. 195" value={form.cholesterol} onChange={set("cholesterol")}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                </div>
              </div>

              {/* File upload */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Attach file (optional)</label>
                <div
                  className="flex items-center gap-3 p-3 rounded-lg border border-dashed cursor-pointer hover:bg-accent/30 transition-colors"
                  onClick={() => fileRef.current?.click()}
                >
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm text-muted-foreground">{file ? file.name : "Click to select PDF or image"}</span>
                  {file && <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }}><X className="h-3.5 w-3.5 text-muted-foreground" /></button>}
                </div>
                <input ref={fileRef} type="file" accept=".pdf,image/*" className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Notes (optional)</label>
                <textarea rows={2} placeholder="Doctor comments, etc." value={form.notes} onChange={set("notes")}
                  className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
              </div>

              <button type="submit" disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium hover:opacity-90 disabled:opacity-60 transition-opacity">
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving…</> : <><Upload className="h-4 w-4" />Save Report</>}
              </button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Report history */}
      <Card className="shadow-soft">
        <CardHeader><CardTitle className="text-base">Report History</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No reports yet. Add your first lab report above.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>HbA1c</TableHead>
                  <TableHead>Fasting Glucose</TableHead>
                  <TableHead>Cholesterol</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((r) => (
                  <TableRow key={r._id}>
                    <TableCell className="font-medium">
                      <span className="inline-flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        {r.fileName ?? "Manual entry"}
                      </span>
                    </TableCell>
                    <TableCell>{r.date}</TableCell>
                    <TableCell>{r.hba1c != null ? `${r.hba1c}%` : "—"}</TableCell>
                    <TableCell>{r.fastingGlucose != null ? `${r.fastingGlucose} mg/dL` : "—"}</TableCell>
                    <TableCell>{r.cholesterol != null ? `${r.cholesterol} mg/dL` : "—"}</TableCell>
                    <TableCell>
                      <button onClick={() => handleDelete(r._id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
