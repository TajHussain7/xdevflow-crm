"use client";

import type { LeadStatus } from "@/types";

interface PipelineChartProps {
  data: Array<{ status: LeadStatus; count: number }>;
}

const STATUS_ORDER: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "closed_won",
  "closed_lost",
];

const STATUS_META: Record<
  LeadStatus,
  { label: string; barClass: string; labelClass: string; dotClass: string }
> = {
  new: {
    label: "New",
    barClass: "bg-status-new-text",
    labelClass: "text-secondary",
    dotClass: "bg-status-new-text",
  },
  contacted: {
    label: "Contacted",
    barClass: "bg-status-contacted-text",
    labelClass: "text-secondary",
    dotClass: "bg-status-contacted-text",
  },
  qualified: {
    label: "Qualified",
    barClass: "bg-status-qualified-text",
    labelClass: "text-secondary",
    dotClass: "bg-status-qualified-text",
  },
  proposal: {
    label: "Proposal",
    barClass: "bg-status-proposal-text",
    labelClass: "text-secondary",
    dotClass: "bg-status-proposal-text",
  },
  closed_won: {
    label: "Won",
    barClass: "bg-success",
    labelClass: "text-success font-bold",
    dotClass: "bg-success",
  },
  closed_lost: {
    label: "Lost",
    barClass: "bg-error",
    labelClass: "text-error",
    dotClass: "bg-error",
  },
};

export default function PipelineChart({ data }: PipelineChartProps) {
  const countMap = Object.fromEntries(data.map((d) => [d.status, d.count]));
  const maxCount = Math.max(1, ...data.map((d) => d.count));
  const total = data.reduce((s, d) => s + d.count, 0);

  const conversion =
    countMap["new"] && countMap["closed_won"]
      ? ((countMap["closed_won"] / countMap["new"]) * 100).toFixed(1)
      : "0.0";

  const winRate =
    (countMap["closed_won"] ?? 0) + (countMap["closed_lost"] ?? 0) > 0
      ? (
          ((countMap["closed_won"] ?? 0) /
            ((countMap["closed_won"] ?? 0) + (countMap["closed_lost"] ?? 0))) *
          100
        ).toFixed(0)
      : "0";

  return (
    <div className="flex flex-col flex-1">
      {/* Funnel bars */}
      <div className="p-5 flex-1 flex flex-col justify-center">
        <div className="flex flex-col gap-3 w-full">
          {STATUS_ORDER.map((status, index) => {
            const meta = STATUS_META[status];
            const count = countMap[status] ?? 0;
            const widthPct = maxCount > 0 ? (count / maxCount) * 100 : 0;
            const isLost = status === "closed_lost";
            const isWon = status === "closed_won";

            return (
              <div key={status} className="flex items-center gap-3 group">
                {/* Status label + dot */}
                <div className="flex items-center gap-1.5 w-[88px] justify-end shrink-0">
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${meta.dotClass} ${isLost ? "opacity-60" : ""}`}
                  />
                  <span
                    className={`text-right font-label-md text-label-md text-[11px] ${meta.labelClass}`}
                  >
                    {meta.label}
                  </span>
                </div>

                {/* Bar track */}
                <div
                  className={`flex-1 bg-surface-container rounded-full overflow-hidden ${
                    isLost ? "h-3 opacity-60" : isWon ? "h-5" : "h-4"
                  }`}
                >
                  <div
                    className={`h-full ${meta.barClass} transition-all duration-700 ease-out rounded-full`}
                    style={{
                      width: `${widthPct}%`,
                      transitionDelay: `${index * 60}ms`,
                    }}
                  />
                </div>

                {/* Count badge */}
                <span className="w-7 text-right font-mono-sm text-mono-sm text-secondary text-[11px] shrink-0 tabular-nums">
                  {count}
                </span>
              </div>
            );
          })}
        </div>

        {/* Metrics footer */}
        <div className="mt-6 pt-5 border-t border-outline-variant/30 grid grid-cols-2 gap-3">
          {/* Conversion rate */}
          <div className="bg-surface-container/50 rounded-xl p-3 text-center border border-outline-variant/30">
            <p className="text-[10px] font-semibold text-secondary uppercase tracking-wide mb-1">
              New → Won
            </p>
            <p className="font-bold text-on-background text-lg tabular-nums">
              {conversion}%
            </p>
            <p className="text-[10px] text-secondary mt-0.5">Conversion</p>
          </div>

          {/* Win rate */}
          <div className="bg-surface-container/50 rounded-xl p-3 text-center border border-outline-variant/30">
            <p className="text-[10px] font-semibold text-secondary uppercase tracking-wide mb-1">
              Closed Deals
            </p>
            <p className="font-bold text-success text-lg tabular-nums">
              {winRate}%
            </p>
            <p className="text-[10px] text-secondary mt-0.5">Win Rate</p>
          </div>
        </div>

        {/* Total */}
        <p className="text-center text-[11px] text-secondary mt-3">
          <span className="font-semibold text-on-surface">{total}</span> leads
          in pipeline
        </p>
      </div>
    </div>
  );
}
