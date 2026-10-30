import type { ReasonId } from "./types";

export const REASONS: { id: ReasonId; label: string; varName: string }[] = [
  { id: "return", label: "Return", varName: "--cat-return" },
  { id: "exchange", label: "Exchange", varName: "--cat-exchange" },
  { id: "damage", label: "Damage / Fault", varName: "--cat-damage" },
  { id: "lost", label: "Lost in Transit", varName: "--cat-lost" },
  { id: "wrong", label: "Wrong Item Sent", varName: "--cat-wrong" },
  { id: "sizing", label: "Sizing / Fit", varName: "--cat-sizing" },
  { id: "delay", label: "Shipping Delay", varName: "--cat-shipping" },
  { id: "inquiry", label: "Inquiry", varName: "--cat-inquiry" },
  { id: "other", label: "Other", varName: "--cat-other" },
];

export function reasonById(id: string) {
  return REASONS.find((r) => r.id === id) ?? REASONS[REASONS.length - 1];
}

export const CHANNELS = ["Email", "Phone", "Live chat", "Social / DM", "Marketplace"];

export const PRIORITIES = ["Low", "Normal", "High", "Urgent"];

export const OVERDUE_DAYS = 5;
