import type { Ticket } from "./types";
import { OVERDUE_DAYS } from "./constants";

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / 86400000);
}

export function ticketAgeDays(t: Pick<Ticket, "date_opened" | "date_closed" | "status">): number {
  const opened = new Date(`${t.date_opened}T00:00:00`);
  const end =
    t.status === "closed" && t.date_closed ? new Date(`${t.date_closed}T00:00:00`) : new Date();
  return Math.max(0, daysBetween(opened, end));
}

export function isOverdue(t: Pick<Ticket, "date_opened" | "date_closed" | "status">): boolean {
  return t.status === "open" && ticketAgeDays(t) >= OVERDUE_DAYS;
}

export function fmtDate(s: string | null | undefined): string {
  if (!s) return "—";
  const d = new Date(`${s}T00:00:00`);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export function initials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] ?? "";
  const second = parts.length > 1 ? parts[1][0] ?? "" : "";
  const result = (first + second).toUpperCase();
  return result || "?";
}
