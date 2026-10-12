"use client";

import type { Ticket } from "@/lib/types";
import { reasonById } from "@/lib/constants";
import { fmtDate, initials, isOverdue, ticketAgeDays } from "@/lib/dates";

export default function TicketTable({
  tickets,
  totalCount,
  onRowClick,
  onNew,
}: {
  tickets: Ticket[];
  totalCount: number;
  onRowClick: (t: Ticket) => void;
  onNew: () => void;
}) {
  const tableBar = (
    <div className="flex items-center justify-between gap-3 flex-wrap px-4 py-3.5 border-b border-[var(--border)]">
      <h2 className="font-display font-semibold text-[15px]">Queries</h2>
      <button
        onClick={onNew}
        className="inline-flex items-center gap-1.5 bg-[var(--accent)] hover:bg-[var(--accent-strong)] text-[var(--accent-ink)] font-semibold text-[13.5px] rounded-lg px-3.5 py-2.5"
      >
        <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
          <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        New query
      </button>
    </div>
  );

  if (totalCount === 0) {
    return (
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[10px] overflow-hidden">
        {tableBar}
        <div className="py-16 px-5 text-center">
          <h3 className="font-display font-semibold text-[19px] text-[var(--ink)] mb-1.5">
            No queries logged yet
          </h3>
          <p className="text-[13.5px] text-[var(--ink-2)] mb-4">
            Add the first customer service query to start the shared log.
          </p>
          <button
            onClick={onNew}
            className="bg-[var(--accent)] hover:bg-[var(--accent-strong)] text-[var(--accent-ink)] font-semibold text-[13.5px] rounded-lg px-4 py-2.5"
          >
            + New query
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[10px] overflow-hidden">
      {tableBar}
      <table className="w-full border-collapse text-[13px] hidden md:table">
        <thead>
          <tr>
            {["Order", "Opened", "Age", "Handler", "Reason", "Channel", "Priority", "Status", "Closed by"].map(
              (h) => (
                <th
                  key={h}
                  className="text-left text-[11px] uppercase tracking-wide text-[var(--muted)] font-semibold px-3.5 py-2.5 border-b border-[var(--border)] bg-[var(--surface-2)] whitespace-nowrap"
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {tickets.length === 0 ? (
            <tr>
              <td colSpan={9} className="text-center text-[var(--muted)] py-8">
                No queries match these filters.
              </td>
            </tr>
          ) : (
            tickets.map((t) => <Row key={t.id} t={t} onClick={() => onRowClick(t)} />)
          )}
        </tbody>
      </table>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-[var(--border)]">
        {tickets.length === 0 ? (
          <div className="text-center text-[var(--muted)] py-8 text-sm">No queries match these filters.</div>
        ) : (
          tickets.map((t) => <CardRow key={t.id} t={t} onClick={() => onRowClick(t)} />)
        )}
      </div>
    </div>
  );
}

function StatusPill({ t }: { t: Ticket }) {
  if (isOverdue(t)) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold bg-[var(--critical-soft)] text-[var(--critical)] whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--critical)" }} />
        Overdue
      </span>
    );
  }
  if (t.status === "closed") {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold whitespace-nowrap"
        style={{ background: "var(--good-soft)", color: "var(--good)" }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--good)" }} />
        Closed
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold whitespace-nowrap"
      style={{ background: "var(--warning-soft)", color: "var(--warning)" }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--warning)" }} />
      Open
    </span>
  );
}

function ReasonPill({ t }: { t: Ticket }) {
  const reason = reasonById(t.reason);
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold border border-[var(--border)] text-[var(--ink-2)] whitespace-nowrap">
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: `var(${reason.varName})` }} />
      {reason.label}
    </span>
  );
}

function AgeLabel({ t }: { t: Ticket }) {
  const age = ticketAgeDays(t);
  const label =
    t.status === "closed"
      ? age === 0
        ? "Same day"
        : `${age}d to close`
      : age === 0
      ? "Today"
      : `${age}d open`;
  return (
    <span className={`font-mono text-[12.5px] tabular-nums ${isOverdue(t) ? "text-[var(--critical)] font-semibold" : "text-[var(--ink-2)]"}`}>
      {label}
    </span>
  );
}

function Row({ t, onClick }: { t: Ticket; onClick: () => void }) {
  return (
    <tr
      onClick={onClick}
      className="cursor-pointer hover:bg-[var(--surface-2)]"
      style={isOverdue(t) ? { boxShadow: "inset 3px 0 0 var(--critical)" } : undefined}
    >
      <td className="px-3.5 py-[11px] border-b border-[var(--border)]">
        <span className="font-mono font-semibold">{t.order_number}</span>
        {t.customer && <span className="block text-[var(--muted)] text-[11.5px] mt-0.5">{t.customer}</span>}
      </td>
      <td className="px-3.5 py-[11px] border-b border-[var(--border)] font-mono">{fmtDate(t.date_opened)}</td>
      <td className="px-3.5 py-[11px] border-b border-[var(--border)]">
        <AgeLabel t={t} />
      </td>
      <td className="px-3.5 py-[11px] border-b border-[var(--border)]">
        <span className="flex items-center gap-1.5">
          <span className="w-[22px] h-[22px] rounded-full bg-[var(--identity-soft)] text-[var(--identity-ink)] flex items-center justify-center text-[10px] font-bold shrink-0">
            {initials(t.handler)}
          </span>
          {t.handler}
        </span>
      </td>
      <td className="px-3.5 py-[11px] border-b border-[var(--border)]">
        <ReasonPill t={t} />
      </td>
      <td className="px-3.5 py-[11px] border-b border-[var(--border)]">{t.channel || "—"}</td>
      <td className="px-3.5 py-[11px] border-b border-[var(--border)]">{t.priority || "—"}</td>
      <td className="px-3.5 py-[11px] border-b border-[var(--border)]">
        <StatusPill t={t} />
      </td>
      <td className="px-3.5 py-[11px] border-b border-[var(--border)]">
        {t.status === "closed" ? t.closed_by || "—" : <span className="text-[var(--muted)]">{"—"}</span>}
      </td>
    </tr>
  );
}

function CardRow({ t, onClick }: { t: Ticket; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="p-3.5 cursor-pointer"
      style={isOverdue(t) ? { boxShadow: "inset 3px 0 0 var(--critical)" } : undefined}
    >
      <div className="flex justify-between items-start gap-2 mb-1.5">
        <div>
          <div className="font-mono font-semibold text-sm">{t.order_number}</div>
          {t.customer && <div className="text-[var(--muted)] text-[11.5px]">{t.customer}</div>}
        </div>
        <StatusPill t={t} />
      </div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        <ReasonPill t={t} />
        <span className="text-[11.5px] text-[var(--muted)] self-center">{t.channel}</span>
      </div>
      <div className="flex justify-between text-[12.5px] text-[var(--ink-2)]">
        <span>
          {t.handler} &middot; {fmtDate(t.date_opened)}
        </span>
        <AgeLabel t={t} />
      </div>
    </div>
  );
}
