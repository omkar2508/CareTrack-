import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/types";

const map: Record<RiskLevel, { label: string; cls: string; dot: string }> = {
  low:    { label: "Low Risk",    cls: "bg-risk-low-soft text-risk-low",       dot: "bg-[hsl(142_65%_42%)]" },
  medium: { label: "Medium Risk", cls: "bg-risk-medium-soft text-risk-medium", dot: "bg-[hsl(38_92%_50%)]" },
  high:   { label: "High Risk",   cls: "bg-risk-high-soft text-risk-high",     dot: "bg-[hsl(0_78%_55%)]" },
};

export function RiskBadge({ level, className }: { level: RiskLevel; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", map[level].cls, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", map[level].dot)} />
      {map[level].label}
    </span>
  );
}
