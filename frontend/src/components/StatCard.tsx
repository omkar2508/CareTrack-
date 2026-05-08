import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit?: string;
  hint?: string;
  tone?: "default" | "good" | "warn" | "bad";
}

const toneCls: Record<NonNullable<Props["tone"]>, string> = {
  default: "bg-primary-soft text-primary",
  good:    "bg-risk-low-soft text-risk-low",
  warn:    "bg-risk-medium-soft text-risk-medium",
  bad:     "bg-risk-high-soft text-risk-high",
};

export function StatCard({ icon: Icon, label, value, unit, hint, tone = "default" }: Props) {
  return (
    <Card className="shadow-soft border-border/70">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">
              {value}
              {unit && <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span>}
            </p>
            {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
          </div>
          <div className={cn("h-10 w-10 rounded-xl grid place-items-center shrink-0", toneCls[tone])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
