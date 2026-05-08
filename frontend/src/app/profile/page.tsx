"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Pencil, User, Mail, Activity, Ruler } from "lucide-react";
import { toast } from "sonner";

const Field = ({ label, value, icon: Icon }: { label: string; value: string | number; icon?: typeof User }) => (
  <div className="flex items-start gap-3 p-4 rounded-xl border bg-card">
    {Icon && (
      <div className="h-8 w-8 rounded-lg bg-primary-soft text-primary grid place-items-center shrink-0">
        <Icon className="h-4 w-4" />
      </div>
    )}
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">{label}</p>
      <p className="mt-0.5 font-semibold">{value || "—"}</p>
    </div>
  </div>
);

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    age: String(user?.age ?? ""),
    gender: user?.gender ?? "Male",
    condition: user?.condition ?? "",
    heightCm: String(user?.heightCm ?? ""),
  });

  const initials = (user?.name ?? "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        age: form.age ? Number(form.age) : undefined,
        gender: form.gender as any,
        condition: form.condition,
        heightCm: form.heightCm ? Number(form.heightCm) : undefined,
      });
      toast.success("Profile updated successfully.");
      setEditing(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Patient Profile</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your personal health details</p>
        </div>
        <button
          onClick={() => setEditing((v) => !v)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium hover:bg-accent transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" />
          {editing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      {/* Avatar card */}
      <Card className="shadow-soft">
        <CardContent className="p-6 flex items-center gap-5">
          <div className="h-16 w-16 rounded-full bg-gradient-primary grid place-items-center text-white text-xl font-bold shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-xl font-semibold">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            {!user?.isProfileComplete && (
              <span className="mt-1 inline-block text-xs px-2 py-0.5 rounded-full bg-risk-medium-soft text-risk-medium font-medium">
                Profile incomplete — please fill in your details
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit form */}
      {editing ? (
        <Card className="shadow-soft">
          <CardHeader><CardTitle className="text-base">Edit Details</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Age</label>
                <input type="number" min={1} max={120} value={form.age} onChange={set("age")} placeholder="e.g. 45"
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Gender</label>
                <select value={form.gender} onChange={set("gender")}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Health Condition</label>
                <input value={form.condition} onChange={set("condition")} placeholder="e.g. Type 2 Diabetes"
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Height (cm)</label>
                <input type="number" min={50} max={250} value={form.heightCm} onChange={set("heightCm")} placeholder="e.g. 170"
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground" />
              </div>
              <div className="sm:col-span-2 pt-1">
                <button type="submit" disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium hover:opacity-90 disabled:opacity-60 transition-opacity">
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving…</> : "Save Changes"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-soft">
          <CardHeader><CardTitle className="text-base">Personal Details</CardTitle></CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Field icon={User} label="Age" value={user?.age ? `${user.age} years` : "Not set"} />
              <Field icon={User} label="Gender" value={user?.gender ?? "Not set"} />
              <Field icon={Activity} label="Condition" value={user?.condition ?? "Not set"} />
              <Field icon={Ruler} label="Height" value={user?.heightCm ? `${user.heightCm} cm` : "Not set"} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account info */}
      <Card className="shadow-soft">
        <CardHeader><CardTitle className="text-base">Account</CardTitle></CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field icon={User} label="Name" value={user?.name ?? "—"} />
            <Field icon={Mail} label="Email" value={user?.email ?? "—"} />
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            To change your email or password, please contact support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
