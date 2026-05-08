"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

// Simple toast state management
let toastFn: ((props: ToastProps) => void) | null = null;

export function toast(props: ToastProps) {
  if (toastFn) toastFn(props);
}

export function Toaster() {
  const [toasts, setToasts] = React.useState<(ToastProps & { id: number })[]>([]);

  React.useEffect(() => {
    toastFn = (props) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { ...props, id }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
    };
    return () => { toastFn = null; };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "rounded-xl border p-4 shadow-elevated animate-fade-in",
            t.variant === "destructive"
              ? "bg-destructive text-destructive-foreground border-destructive"
              : "bg-card text-card-foreground border-border"
          )}
        >
          {t.title && <p className="font-semibold text-sm">{t.title}</p>}
          {t.description && <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>}
        </div>
      ))}
    </div>
  );
}
