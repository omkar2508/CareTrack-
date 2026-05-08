"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Activity, FileText, Heart, LayoutDashboard,
  LogOut, MessageCircle, ShieldAlert, User,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard",  label: "Dashboard",      icon: LayoutDashboard },
  { to: "/profile",    label: "Profile",         icon: User },
  { to: "/reports",    label: "Lab Reports",     icon: FileText },
  { to: "/activity",   label: "Daily Activity",  icon: Activity },
  { to: "/risk",       label: "Risk & Insights", icon: ShieldAlert },
  { to: "/chatbot",    label: "Care Assistant",  icon: MessageCircle },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.push("/auth/login");
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-primary grid place-items-center animate-pulse">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <p className="text-sm text-muted-foreground">Loading CareTrack…</p>
        </div>
      </div>
    );
  }

  const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r bg-sidebar">
        <div className="px-5 py-5 flex items-center gap-2 border-b">
          <div className="h-9 w-9 rounded-xl bg-gradient-primary grid place-items-center shadow-soft">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-semibold leading-tight">CareTrack</p>
            <p className="text-xs text-muted-foreground">Patient Wellness</p>
          </div>
        </div>

        <nav className="px-3 py-3 space-y-1 flex-1">
          {nav.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                href={to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-gradient-primary grid place-items-center text-white text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="h-14 border-b bg-card/80 backdrop-blur sticky top-0 z-10 flex items-center gap-3 px-4 md:hidden">
          <div className="flex items-center gap-2 flex-1">
            <div className="h-7 w-7 rounded-lg bg-gradient-primary grid place-items-center">
              <Heart className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm">CareTrack</span>
          </div>
          {/* Mobile nav */}
          <div className="flex gap-1">
            {nav.map(({ to, icon: Icon }) => (
              <Link
                key={to}
                href={to}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  pathname === to ? "bg-sidebar-accent text-primary" : "text-muted-foreground hover:bg-accent"
                )}
              >
                <Icon className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </header>

        {/* Desktop top bar */}
        <header className="h-14 border-b bg-card/60 backdrop-blur sticky top-0 z-10 items-center gap-3 px-8 hidden md:flex">
          <p className="text-sm text-muted-foreground ml-auto">
            Welcome, <span className="font-medium text-foreground">{user.name.split(" ")[0]}</span>
          </p>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
