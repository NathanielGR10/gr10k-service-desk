"use client";

export default function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Delete",
  onCancel,
  onConfirm,
  busy,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
  busy?: boolean;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-[100]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-[380px] shadow-lg">
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <h2 className="font-display font-semibold text-[19px]">{title}</h2>
        </div>
        <div className="px-5 py-4">
          <p className="text-[13.5px] text-[var(--ink-2)] mb-4">{body}</p>
          <div className="flex gap-2.5 justify-end">
            <button
              onClick={onCancel}
              className="border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--ink)] font-semibold text-[13.5px] rounded-lg px-3.5 py-2"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={busy}
              className="bg-[var(--critical)] border border-[var(--critical)] text-white font-semibold text-[13.5px] rounded-lg px-3.5 py-2 disabled:opacity-50"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
