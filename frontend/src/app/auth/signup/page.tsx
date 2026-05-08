"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Heart, Loader2 } from "lucide-react";

export default function SignupPage() {
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password, form.confirmPassword);
    } catch (err: any) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { id: "name", label: "Full name", type: "text", placeholder: "Aarav Sharma" },
    { id: "email", label: "Email", type: "email", placeholder: "you@example.com" },
    { id: "password", label: "Password", type: "password", placeholder: "Min. 6 characters" },
    { id: "confirmPassword", label: "Confirm password", type: "password", placeholder: "••••••••" },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary grid place-items-center shadow-elevated">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <p className="text-xl font-bold">CareTrack</p>
          </div>
          <p className="text-muted-foreground mt-2 text-sm">Create your free account</p>
        </div>

        <div className="rounded-2xl border bg-card shadow-elevated p-8">
          <h1 className="text-2xl font-semibold mb-6">Get started</h1>

          {error && (
            <div className="mb-4 rounded-lg bg-risk-high-soft text-risk-high px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ id, label, type, placeholder }) => (
              <div key={id} className="space-y-1.5">
                <label className="text-sm font-medium">{label}</label>
                <input
                  type={type}
                  required
                  value={form[id]}
                  onChange={set(id)}
                  placeholder={placeholder}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground"
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-lg bg-gradient-primary text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</> : "Create account"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            <Link href="/landing" className="hover:underline">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
