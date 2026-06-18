"use client";

import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  /** Material Symbols icon name e.g. "group", "fiber_new" */
  iconName: string;
  /** Tailwind text + bg colour pair for the icon e.g. "text-primary bg-primary/10" */
  iconColor?: string;
  /** Tailwind colour for the decorative blur orb e.g. "bg-primary/5" */
  orbColor?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
  className?: string;
}

export default function StatCard({
  title,
  value,
  iconName,
  iconColor = "text-primary bg-primary/10",
  orbColor = "bg-primary/5",
  trend,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/50",
        "hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:-translate-y-0.5",
        "shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-all duration-200 relative overflow-hidden",
        "group cursor-default",
        className,
      )}
    >
      {/* Decorative blur orb */}
      <div
        className={cn(
          "absolute -right-5 -top-5 w-28 h-28 rounded-full blur-2xl transition-transform duration-300 group-hover:scale-110",
          orbColor,
        )}
      />

      {/* Header row */}
      <div className="flex justify-between items-start mb-5 relative z-10">
        <h3 className="font-label-md text-label-md text-secondary uppercase tracking-widest text-[11px]">
          {title}
        </h3>
        <span
          className={cn(
            "material-symbols-outlined p-2 rounded-xl text-[20px] select-none",
            "transition-transform duration-200 group-hover:scale-110",
            iconColor,
          )}
        >
          {iconName}
        </span>
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-2 relative z-10">
        <span className="font-display-lg text-display-lg text-on-background tabular-nums">
          {value}
        </span>
      </div>

      {/* Trend */}
      {trend && (
        <div
          className={cn(
            "mt-3 flex items-center gap-1 font-label-md text-label-md text-[12px]",
            "relative z-10 transition-opacity",
            trend.positive ? "text-success" : "text-danger",
          )}
        >
          <span className="material-symbols-outlined text-[15px] select-none">
            {trend.positive ? "trending_up" : "trending_down"}
          </span>
          <span>{trend.value}</span>
        </div>
      )}

      {/* Bottom accent line — animates in on hover */}
      <div
        className={cn(
          "absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-300 rounded-full",
          iconColor.includes("text-primary")
            ? "bg-primary/40"
            : iconColor.includes("status-new")
              ? "bg-status-new-text/40"
              : iconColor.includes("qualified")
                ? "bg-status-qualified-text/40"
                : iconColor.includes("won")
                  ? "bg-success/40"
                  : "bg-primary/40",
        )}
      />
    </div>
  );
}
