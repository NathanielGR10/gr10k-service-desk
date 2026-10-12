export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; from?: string };
}) {
  const error = searchParams?.error;
  const from = searchParams?.from ?? "/";

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--paper)] px-4">
      <form
        action="/api/login"
        method="POST"
        className="w-full max-w-sm bg-[var(--surface)] border border-[var(--border)] rounded-xl p-7 shadow-sm"
      >
        <div className="inline-flex items-center gap-2 mb-1">
          <span className="bg-[var(--accent)] text-[var(--accent-ink)] font-display font-bold text-[13px] tracking-wide px-2.5 py-1 rounded">
            GR10K
          </span>
        </div>
        <h1 className="font-display font-semibold text-[26px] leading-none text-[var(--ink)] mt-2">
          Service Desk
        </h1>
        <p className="text-[13px] text-[var(--ink-2)] mt-1 mb-5">
          Enter the shared team passcode to open the query log.
        </p>

        <input type="hidden" name="from" value={from} />

        <label htmlFor="password" className="block text-xs font-semibold text-[var(--ink-2)] mb-1.5">
          Passcode
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoFocus
          required
          className="w-full border border-[var(--border)] bg-[var(--paper)] text-[var(--ink)] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
        />

        {error === "1" && (
          <p className="text-[var(--critical)] text-xs mt-2">That passcode isn&rsquo;t right &mdash; try again.</p>
        )}
        {error === "not-configured" && (
          <p className="text-[var(--critical)] text-xs mt-2">
            No passcode is set yet. Add <code>APP_PASSWORD</code> to your environment variables.
          </p>
        )}

        <button
          type="submit"
          className="w-full mt-5 bg-[var(--accent)] hover:bg-[var(--accent-strong)] text-[var(--accent-ink)] font-semibold text-sm rounded-lg py-2.5 transition-colors"
        >
          Enter
        </button>
      </form>
    </main>
  );
}
