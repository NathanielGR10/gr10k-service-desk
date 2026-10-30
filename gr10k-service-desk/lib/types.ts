export type Status = "open" | "closed";

export type ReasonId =
  | "return"
  | "exchange"
  | "damage"
  | "lost"
  | "wrong"
  | "sizing"
  | "delay"
  | "inquiry"
  | "other";

export interface Ticket {
  id: string;
  order_number: string;
  date_opened: string; // YYYY-MM-DD
  handler: string;
  customer: string | null;
  reason: ReasonId;
  channel: string | null;
  priority: string | null;
  status: Status;
  closed_by: string | null;
  date_closed: string | null; // YYYY-MM-DD
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type NewTicket = Omit<Ticket, "id" | "created_at" | "updated_at">;
