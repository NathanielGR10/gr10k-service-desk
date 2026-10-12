"use client";

import type { Ticket } from "@/lib/types";
import { isOverdue } from "@/lib/dates";

export default function StatsRow({ tickets }: { tickets: Ticket[] }) {
  const open = tickets.filter((t) => t.status === "open").length;
  const closed = tickets.filter((t) => t.status === "closed").length;
  const overdue = tickets.filter(isOverdue).length;

  const items = [
    { label: "Open", value: open, border: "var(--warning)" },
    { label: "Closed", value: closed, border: "var(--good)" },
    { label: "Total logged", value: tickets.length, border: "var(--border-strong)" },
    { label: "Open 5+ days", value: overdue, border: "var(--critical)", danger: true },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
      {items.map((it) => (
        <div
          key={it.label}
          className="bg-[var(--surface)] border border-[var(--border)] rounded-[10px] px-4 py-3.5"
          style={{ borderLeft: `3px solid ${it.border}` }}
        >
          <div
            className="font-mono text-[26px] font-semibold leading-none tabular-nums"
            style={{ color: it.danger ? "var(--critical)" : "var(--ink)" }}
          >
            {it.value}
          </div>
          <div className="text-xs text-[var(--ink-2)] mt-1">{it.label}</div>
        </div>
      ))}
    </div>
  );
}
