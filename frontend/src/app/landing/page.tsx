"use client";

import Link from "next/link";
import {
  Activity, FileText, Heart, MessageCircle, ShieldAlert,
  Footprints, TrendingUp, CheckCircle2, ArrowRight, Stethoscope,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Lab Report Tracking",
    desc: "Upload your lab reports and automatically track HbA1c, fasting glucose, and cholesterol over time.",
  },
  {
    icon: Footprints,
    title: "Daily Activity Logging",
    desc: "Log your steps, weight, glucose readings, and water intake every day with a simple form.",
  },
  {
    icon: ShieldAlert,
    title: "Risk Detection",
    desc: "Our rule-based engine analyses your data and assigns Low, Medium, or High risk levels with clear explanations.",
  },
  {
    icon: TrendingUp,
    title: "Visual Insights",
    desc: "Interactive charts show your glucose trend, step history, and weight progression at a glance.",
  },
  {
    icon: MessageCircle,
    title: "AI Care Assistant",
    desc: "Ask the chatbot questions about your health. It reads your actual data and gives personalised guidance.",
  },
  {
    icon: Stethoscope,
    title: "Doctor Recommendations",
    desc: "When risk is high, the system proactively reminds you to consult your physician.",
  },
];

const conditions = [
  { name: "Type 2 Diabetes", icon: "🩸", desc: "Track glucose, HbA1c & medication adherence" },
  { name: "Obesity", icon: "⚖️", desc: "Monitor weight, BMI, and daily activity" },
  { name: "Metabolic Syndrome", icon: "💊", desc: "Combined tracking for multiple risk factors" },
];

const steps = [
  { n: "01", title: "Create your account", desc: "Register in seconds — no medical expertise needed." },
  { n: "02", title: "Build your profile", desc: "Add your age, height, and health condition." },
  { n: "03", title: "Upload a report", desc: "Add your latest lab report with key values." },
  { n: "04", title: "Log daily activity", desc: "Record steps, weight, and glucose each day." },
  { n: "05", title: "Get insights", desc: "See your risk level, charts, and actionable tips." },
  { n: "06", title: "Chat with AI", desc: "Ask the assistant anything about your health data." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Navbar ─────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-primary grid place-items-center shadow-soft">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold leading-tight">CareTrack</p>
              <p className="text-xs text-muted-foreground hidden sm:block">Patient Wellness</p>
            </div>
          </div>
          <nav className="flex items-center gap-3">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground hidden sm:block">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground hidden sm:block">
              How it works
            </Link>
            <Link
              href="/auth/login"
              className="text-sm px-4 py-2 rounded-lg border hover:bg-accent transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              className="text-sm px-4 py-2 rounded-lg bg-gradient-primary text-white hover:opacity-90 transition-opacity shadow-soft"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-hero border-b">
        <div className="max-w-6xl mx-auto px-4 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-soft text-primary text-xs font-medium mb-6">
            <Activity className="h-3.5 w-3.5" />
            Continuous health monitoring
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            Monitor your health<br />
            <span className="text-primary">between doctor visits</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            CareTrack helps patients with Diabetes and Obesity track reports, log daily activity,
            detect risk early, and get AI-powered guidance — all in one place.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-primary text-white font-medium shadow-elevated hover:opacity-90 transition-opacity"
            >
              Start monitoring for free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border bg-card font-medium hover:bg-accent transition-colors"
            >
              Sign in to my account
            </Link>
          </div>

          {/* Stats row */}
          <div className="mt-16 grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {[
              { v: "6", l: "Core modules" },
              { v: "AI", l: "Powered chatbot" },
              { v: "100%", l: "Free for demo" },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl border bg-card p-4 shadow-soft">
                <p className="text-2xl font-bold text-primary">{s.v}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Conditions ─────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <p className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-8">
          Built for patients managing
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          {conditions.map((c) => (
            <div key={c.name} className="rounded-2xl border bg-card p-6 shadow-soft text-center hover:shadow-elevated transition-shadow">
              <div className="text-4xl mb-3">{c.icon}</div>
              <p className="font-semibold">{c.name}</p>
              <p className="text-sm text-muted-foreground mt-1">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ───────────────────────────────── */}
      <section id="features" className="bg-gradient-soft border-y py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Everything you need to stay ahead</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Each module works together to give you a complete picture of your health.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <Link href="/auth/login" key={f.title} className="group rounded-2xl border bg-card p-6 shadow-soft hover:shadow-elevated transition-all hover:-translate-y-0.5">
                <div className="h-11 w-11 rounded-xl bg-primary-soft text-primary grid place-items-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                  <f.icon className="h-5 w-5" />
                </div>
                <p className="font-semibold">{f.title}</p>
                <p className="text-sm text-muted-foreground mt-2">{f.desc}</p>
                <p className="mt-3 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  Open feature <ArrowRight className="h-3 w-3" />
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────── */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">How CareTrack works</h2>
          <p className="text-muted-foreground mt-3">Six simple steps from signup to personalised insights</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {steps.map((s) => (
            <div key={s.n} className="rounded-2xl border bg-card p-6 shadow-soft">
              <p className="text-3xl font-black text-primary/20">{s.n}</p>
              <p className="font-semibold mt-2">{s.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────── */}
      <section className="bg-gradient-primary py-16">
        <div className="max-w-2xl mx-auto px-4 text-center text-white">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-10 w-10 opacity-90" />
          </div>
          <h2 className="text-3xl font-bold">Ready to take control of your health?</h2>
          <p className="mt-3 opacity-85">
            Join CareTrack today and start monitoring continuously — not just during hospital visits.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/auth/signup"
              className="px-6 py-3 rounded-xl bg-white text-primary font-semibold hover:bg-primary-soft transition-colors shadow-elevated"
            >
              Create free account
            </Link>
            <Link
              href="/auth/login"
              className="px-6 py-3 rounded-xl border border-white/30 text-white font-medium hover:bg-white/10 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────── */}
      <footer className="border-t bg-card py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-primary grid place-items-center">
              <Heart className="h-4 w-4 text-white" />
            </div>
            <span className="font-medium text-foreground">CareTrack</span>
            <span>— Patient Wellness System</span>
          </div>
          <p>Demo project · For educational purposes only</p>
        </div>
      </footer>
    </div>
  );
}
