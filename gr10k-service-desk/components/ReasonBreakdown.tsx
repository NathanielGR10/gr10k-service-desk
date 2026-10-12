"use client";

import type { Ticket } from "@/lib/types";
import { REASONS } from "@/lib/constants";

export default function ReasonBreakdown({ tickets }: { tickets: Ticket[] }) {
  if (tickets.length === 0) {
    return (
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[10px] px-[18px] py-4 mb-4">
        <h2 className="font-display font-semibold text-[15px] mb-1">By reason</h2>
        <div className="text-[13px] text-[var(--muted)]">Nothing logged yet.</div>
      </div>
    );
  }

  const counts: Record<string, number> = {};
  REASONS.forEach((r) => (counts[r.id] = 0));
  tickets.forEach((t) => (counts[t.reason] = (counts[t.reason] || 0) + 1));

  const rows = REASONS.map((r) => ({ r, n: counts[r.id] || 0 }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n);
  const max = Math.max(...rows.map((x) => x.n), 1);

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[10px] px-[18px] py-4 mb-4">
      <h2 className="font-display font-semibold text-[15px] mb-3">By reason</h2>
      {rows.map(({ r, n }) => {
        const pct = Math.round((n / max) * 100);
        const color = `var(${r.varName})`;
        return (
          <div key={r.id} className="flex items-center gap-2.5 my-2.5">
            <span className="w-[132px] shrink-0 text-[12.5px] flex items-center gap-1.5 text-[var(--ink-2)]">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
              {r.label}
            </span>
            <span className="flex-1 h-2 bg-[var(--surface-2)] rounded overflow-hidden">
              <span
                className="block h-full rounded"
                style={{ width: `${pct}%`, background: color, minWidth: 3 }}
              />
            </span>
            <span className="w-[26px] shrink-0 text-right text-[12.5px] font-semibold tabular-nums">
              {n}
            </span>
          </div>
        );
      })}
    </div>
  );
}
