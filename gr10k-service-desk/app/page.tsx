"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { NewTicket, Ticket } from "@/lib/types";
import Toolbar, { Filters } from "@/components/Toolbar";
import TicketTable from "@/components/TicketTable";
import TicketFormModal from "@/components/TicketFormModal";
import ThemeToggle from "@/components/ThemeToggle";

const TABLE = "tickets";

export default function HomePage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "all",
    reason: "all",
    handler: "all",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Ticket | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      const { data, error } = await supabase
        .from(TABLE)
        .select("*")
        .order("date_opened", { ascending: false })
        .limit(1000);
      if (!active) return;
      if (error) {
        setLoadError(error.message);
      } else {
        setLoadError(null);
        setTickets((data as Ticket[]) ?? []);
      }
      setLoading(false);
    }
    load();

    const channel = supabase
      .channel("tickets-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: TABLE }, () => {
        load();
      })
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const handlerSuggestions = useMemo(() => {
    const set = new Set<string>();
    tickets.forEach((t) => {
      if (t.handler) set.add(t.handler);
      if (t.closed_by) set.add(t.closed_by);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [tickets]);

  const filteredSorted = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    let list = tickets.filter((t) => {
      if (filters.status !== "all" && t.status !== filters.status) return false;
      if (filters.reason !== "all" && t.reason !== filters.reason) return false;
      if (filters.handler !== "all" && t.handler !== filters.handler) return false;
      if (q) {
        const hay = `${t.order_number ?? ""} ${t.customer ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => {
      if (a.status !== b.status) return a.status === "open" ? -1 : 1;
      if (a.status === "open") {
        return new Date(a.date_opened).getTime() - new Date(b.date_opened).getTime();
      }
      return (
        new Date(b.date_closed ?? b.date_opened).getTime() -
        new Date(a.date_closed ?? a.date_opened).getTime()
      );
    });
    return list;
  }, [tickets, filters]);

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (t: Ticket) => {
    setEditing(t);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const saveTicket = async (payload: NewTicket, id: string | null) => {
    if (id) {
      const { error } = await supabase
        .from(TABLE)
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...payload } : t)));
    } else {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from(TABLE)
        .insert({ ...payload, created_at: now, updated_at: now })
        .select()
        .single();
      if (error) throw error;
      if (data) setTickets((prev) => [data as Ticket, ...prev]);
    }
  };

  const deleteTicket = async (id: string) => {
    const { error } = await supabase.from(TABLE).delete().eq("id", id);
    if (error) throw error;
    setTickets((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <main className="max-w-[1180px] mx-auto px-4">
      <header className="sticky top-4 z-20 bg-[var(--surface)] border border-[var(--border)] rounded-[10px] shadow-[var(--shadow)] px-[22px] py-[18px] mt-4 mb-5">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-header-serif font-bold text-[26px] leading-tight">Service Desk</h1>
            <p className="font-header-serif text-[14px] text-[var(--ink-2)] mt-1">
              Customer query log — returns, exchanges, damages and more
            </p>
          </div>
          <div className="flex items-center gap-3.5">
            <ThemeToggle />
            <form action="/api/logout" method="POST">
              <button
                type="submit"
                className="border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--ink-2)] font-semibold text-[13px] rounded-lg px-3 py-2"
              >
                Log out
              </button>
            </form>
            <div className="flex flex-col items-end gap-1.5">
              <span className="font-header-serif text-[11px] font-bold tracking-wider uppercase text-[var(--ink-2)] whitespace-nowrap">
                GR10K S.R.L &middot; MILANO
              </span>
              <img src="/gr10k-logo.png" alt="GR10K logo" className="h-9 w-auto block" />
            </div>
          </div>
        </div>
      </header>

      {loadError && (
        <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-[12.5px] text-[var(--ink-2)] mt-4">
          Couldn&rsquo;t reach Supabase: {loadError}. Check <code>NEXT_PUBLIC_SUPABASE_URL</code> /{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> and that <code>supabase/schema.sql</code> has been run.
        </div>
      )}

      <Toolbar filters={filters} onChange={setFilters} handlers={handlerSuggestions} tickets={tickets} />

      {loading ? (
        <div className="text-center text-[var(--footer-ink)] text-sm py-16">Loading…</div>
      ) : (
        <>
          <TicketTable
            tickets={filteredSorted}
            totalCount={tickets.length}
            onRowClick={openEdit}
            onNew={openNew}
          />
          {tickets.length > 0 && (
            <div className="inline-block text-xs text-[var(--ink-2)] bg-[var(--surface)] border border-[var(--border)] rounded-full px-3.5 py-1.5 mt-3.5 mb-5">
              Showing {filteredSorted.length} of {tickets.length}{" "}
              {tickets.length === 1 ? "query" : "queries"}
            </div>
          )}
        </>
      )}

      <footer className="text-center text-[11.5px] text-[var(--footer-ink)] py-8">
        GR10K Service Desk · shared, live log for the customer service team
      </footer>

      <TicketFormModal
        open={modalOpen}
        editing={editing}
        handlerSuggestions={handlerSuggestions}
        onClose={closeModal}
        onSave={saveTicket}
        onDelete={deleteTicket}
      />
    </main>
  );
}
