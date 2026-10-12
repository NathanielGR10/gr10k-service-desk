"use client";

import { useMemo } from "react";
import { REASONS } from "@/lib/constants";
import type { Status, Ticket } from "@/lib/types";

export interface Filters {
  search: string;
  status: Status | "all";
  reason: string;
  handler: string;
}

export default function Toolbar({
  filters,
  onChange,
  handlers,
  tickets,
}: {
  filters: Filters;
  onChange: (next: Filters) => void;
  handlers: string[];
  tickets: Ticket[];
}) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });

  const counts = useMemo(
    () => ({
      all: tickets.length,
      open: tickets.filter((t) => t.status === "open").length,
      closed: tickets.filter((t) => t.status === "closed").length,
    }),
    [tickets]
  );

  return (
    <div className="flex gap-2 items-center flex-wrap mb-3">
      <div className="flex-1 min-w-[220px] flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2">
        <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-[var(--muted)] shrink-0">
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          placeholder="Search order number or customer…"
          value={filters.search}
          onChange={(e) => set({ search: e.target.value })}
          className="border-0 outline-none bg-transparent text-[var(--ink)] text-[13.5px] w-full"
        />
      </div>

      <div className="flex border border-[var(--border)] rounded-lg overflow-hidden">
        {(["all", "open", "closed"] as const).map((val, i) => {
          const active = filters.status === val;
          const label = val === "all" ? "All" : val === "open" ? "Open" : "Closed";
          return (
            <button
              key={val}
              onClick={() => set({ status: val })}
              className={`border-0 px-3.5 py-2 text-[13px] font-semibold cursor-pointer ${
                i < 2 ? "border-r border-[var(--border)]" : ""
              } ${active ? "bg-[var(--active-bg)] text-[var(--active-ink)]" : "bg-[var(--surface)] text-[var(--ink-2)]"}`}
            >
              {label}
              <span
                className={`ml-1.5 inline-flex items-center justify-center min-w-[20px] h-[18px] px-1.5 rounded-full text-[11.5px] font-bold align-middle ${
                  active ? "bg-white/20 text-[var(--active-ink)]" : "bg-[var(--surface-2)] text-[var(--ink-2)]"
                }`}
              >
                {counts[val]}
              </span>
            </button>
          );
        })}
      </div>

      <select
        value={filters.reason}
        onChange={(e) => set({ reason: e.target.value })}
        className="border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] rounded-lg px-2.5 py-2 text-[13px] cursor-pointer"
      >
        <option value="all">All reasons</option>
        {REASONS.map((r) => (
          <option key={r.id} value={r.id}>
            {r.label}
          </option>
        ))}
      </select>

      <select
        value={filters.handler}
        onChange={(e) => set({ handler: e.target.value })}
        className="border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] rounded-lg px-2.5 py-2 text-[13px] cursor-pointer"
      >
        <option value="all">All handlers</option>
        {handlers.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
    </div>
  );
}
