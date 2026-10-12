"use client";

import { useEffect, useState } from "react";
import type { NewTicket, Status, Ticket } from "@/lib/types";
import { CHANNELS, PRIORITIES, REASONS } from "@/lib/constants";
import { todayStr } from "@/lib/dates";

export interface TicketDraft {
  order_number: string;
  date_opened: string;
  handler: string;
  customer: string;
  reason: string;
  channel: string;
  priority: string;
  notes: string;
  status: Status;
  closed_by: string;
  date_closed: string;
}

function blankDraft(): TicketDraft {
  return {
    order_number: "",
    date_opened: todayStr(),
    handler: "",
    customer: "",
    reason: REASONS[0].id,
    channel: CHANNELS[0],
    priority: "Normal",
    notes: "",
    status: "open",
    closed_by: "",
    date_closed: todayStr(),
  };
}

function draftFromTicket(t: Ticket): TicketDraft {
  return {
    order_number: t.order_number,
    date_opened: t.date_opened,
    handler: t.handler,
    customer: t.customer ?? "",
    reason: t.reason,
    channel: t.channel ?? CHANNELS[0],
    priority: t.priority ?? "Normal",
    notes: t.notes ?? "",
    status: t.status,
    closed_by: t.closed_by ?? "",
    date_closed: t.date_closed ?? todayStr(),
  };
}

export default function TicketFormModal({
  open,
  editing,
  handlerSuggestions,
  onClose,
  onSave,
  onDelete,
}: {
  open: boolean;
  editing: Ticket | null;
  handlerSuggestions: string[];
  onClose: () => void;
  onSave: (draft: NewTicket, id: string | null) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState<TicketDraft>(blankDraft());
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setConfirmingDelete(false);
    setDraft(editing ? draftFromTicket(editing) : blankDraft());
  }, [open, editing]);

  if (!open) return null;

  const set = (patch: Partial<TicketDraft>) => setDraft((d) => ({ ...d, ...patch }));

  const setStatus = (status: Status) => {
    if (status === "closed" && !draft.closed_by) {
      set({ status, closed_by: draft.handler });
    } else {
      set({ status });
    }
  };

  const handleSave = async () => {
    if (!draft.order_number.trim() || !draft.date_opened || !draft.handler.trim()) {
      setError("Order number, date opened and handler are required.");
      return;
    }
    if (draft.status === "closed" && !draft.closed_by.trim()) {
      setError("Add who closed this query.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const payload: NewTicket = {
        order_number: draft.order_number.trim(),
        date_opened: draft.date_opened,
        handler: draft.handler.trim(),
        customer: draft.customer.trim() || null,
        reason: draft.reason as NewTicket["reason"],
        channel: draft.channel || null,
        priority: draft.priority || null,
        notes: draft.notes.trim() || null,
        status: draft.status,
        closed_by: draft.status === "closed" ? draft.closed_by.trim() : null,
        date_closed: draft.status === "closed" ? draft.date_closed || todayStr() : null,
      };
      await onSave(payload, editing ? editing.id : null);
      onClose();
    } catch (e) {
      console.error(e);
      setError("Couldn't save — please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await onDelete(editing.id);
      onClose();
    } catch (e) {
      console.error(e);
      setError("Couldn't delete — please try again.");
      setConfirmingDelete(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-[100] overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-[560px] shadow-lg max-h-[calc(100vh-48px)] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <h2 className="font-header-serif font-semibold text-[19px]">
            {editing ? `Order ${editing.order_number}` : "New query"}
          </h2>
          <button onClick={onClose} aria-label="Close" className="p-1.5 text-[var(--ink-2)]">
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="px-5 pt-4 pb-1">
          <Row2>
            <Field label="Order number *">
              <TextInput
                value={draft.order_number}
                onChange={(v) => set({ order_number: v })}
                placeholder="e.g. GR-10492"
              />
            </Field>
            <Field label="Date opened *">
              <DateInput value={draft.date_opened} onChange={(v) => set({ date_opened: v })} />
            </Field>
          </Row2>

          <Row2>
            <Field label="Handling *">
              <TextInput
                value={draft.handler}
                onChange={(v) => set({ handler: v })}
                placeholder="Who's on this"
                list="handler-suggestions"
              />
            </Field>
            <Field label="Customer (optional)">
              <TextInput
                value={draft.customer}
                onChange={(v) => set({ customer: v })}
                placeholder="Name or email"
              />
            </Field>
          </Row2>
          <datalist id="handler-suggestions">
            {handlerSuggestions.map((h) => (
              <option key={h} value={h} />
            ))}
          </datalist>

          <Row2>
            <Field label="Reason">
              <SelectInput
                value={draft.reason}
                onChange={(v) => set({ reason: v })}
                options={REASONS.map((r) => ({ value: r.id, label: r.label }))}
              />
            </Field>
            <Field label="Channel">
              <SelectInput
                value={draft.channel}
                onChange={(v) => set({ channel: v })}
                options={CHANNELS.map((c) => ({ value: c, label: c }))}
              />
            </Field>
          </Row2>

          <Field label="Priority">
            <SelectInput
              value={draft.priority}
              onChange={(v) => set({ priority: v })}
              options={PRIORITIES.map((p) => ({ value: p, label: p }))}
            />
          </Field>

          <Field label="Status">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStatus("open")}
                className={`flex-1 py-2.5 rounded-lg border text-[13px] font-semibold ${
                  draft.status === "open"
                    ? "bg-[var(--warning-soft)] border-[var(--warning)]"
                    : "bg-[var(--surface)] border-[var(--border)] text-[var(--ink-2)]"
                }`}
                style={draft.status === "open" ? { color: "#8a5a00" } : undefined}
              >
                Open
              </button>
              <button
                type="button"
                onClick={() => setStatus("closed")}
                className={`flex-1 py-2.5 rounded-lg border text-[13px] font-semibold ${
                  draft.status === "closed"
                    ? "bg-[var(--good-soft)] border-[var(--good)]"
                    : "bg-[var(--surface)] border-[var(--border)] text-[var(--ink-2)]"
                }`}
                style={draft.status === "closed" ? { color: "#0a7a0a" } : undefined}
              >
                Closed
              </button>
            </div>
          </Field>

          {draft.status === "closed" && (
            <Row2>
              <Field label="Closed by *">
                <TextInput
                  value={draft.closed_by}
                  onChange={(v) => set({ closed_by: v })}
                  placeholder="Who resolved it"
                  list="handler-suggestions"
                />
              </Field>
              <Field label="Date closed">
                <DateInput value={draft.date_closed} onChange={(v) => set({ date_closed: v })} />
              </Field>
            </Row2>
          )}

          <Field label="Notes">
            <textarea
              value={draft.notes}
              onChange={(e) => set({ notes: e.target.value })}
              placeholder="What happened, resolution, tracking numbers…"
              className="w-full border border-[var(--border)] bg-[var(--paper)] text-[var(--ink)] rounded-lg px-2.5 py-2 text-[13.5px] outline-none focus:border-[var(--accent)] min-h-[64px] resize-y"
            />
          </Field>

          {error && <p className="text-[var(--critical)] text-xs mb-2">{error}</p>}
        </div>

        <div className="flex justify-between items-center gap-2.5 px-5 pb-5 pt-3">
          {editing ? (
            <button
              onClick={() => setConfirmingDelete(true)}
              className="text-[var(--critical)] border border-[var(--critical)] bg-transparent rounded-lg px-3.5 py-2 text-[13.5px] font-semibold"
            >
              Delete query
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2.5">
            <button
              onClick={onClose}
              className="border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--ink)] font-semibold text-[13.5px] rounded-lg px-3.5 py-2"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[var(--accent)] hover:bg-[var(--accent-strong)] text-[var(--accent-ink)] font-semibold text-[13.5px] rounded-lg px-4 py-2 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {confirmingDelete && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-[110]"
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirmingDelete(false);
          }}
        >
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-[380px] shadow-lg">
            <div className="px-5 py-4 border-b border-[var(--border)]">
              <h2 className="font-display font-semibold text-[19px]">Delete this query?</h2>
            </div>
            <div className="px-5 py-4">
              <p className="text-[13.5px] text-[var(--ink-2)] mb-4">
                This removes it from the shared log for everyone. This can&rsquo;t be undone.
              </p>
              <div className="flex gap-2.5 justify-end">
                <button
                  onClick={() => setConfirmingDelete(false)}
                  className="border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--ink)] font-semibold text-[13.5px] rounded-lg px-3.5 py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="bg-[var(--critical)] border border-[var(--critical)] text-white font-semibold text-[13.5px] rounded-lg px-3.5 py-2 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row2({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3.5">
      <label className="block text-xs font-semibold text-[var(--ink-2)] mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  list,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  list?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      list={list}
      className="w-full border border-[var(--border)] bg-[var(--paper)] text-[var(--ink)] rounded-lg px-2.5 py-2 text-[13.5px] outline-none focus:border-[var(--accent)]"
    />
  );
}

function DateInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-[var(--border)] bg-[var(--paper)] text-[var(--ink)] rounded-lg px-2.5 py-2 text-[13.5px] outline-none focus:border-[var(--accent)]"
    />
  );
}

function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-[var(--border)] bg-[var(--paper)] text-[var(--ink)] rounded-lg px-2.5 py-2 text-[13.5px] outline-none focus:border-[var(--accent)]"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
