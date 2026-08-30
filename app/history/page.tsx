"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SessionForm from "@/components/SessionForm";
import SessionList from "@/components/SessionList";
import StatsBar from "@/components/StatsBar";
import { deleteSession, insertSession, loadSessions } from "@/lib/storage";
import { TrainingSession } from "@/lib/types";

export default function HistoryPage() {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSessions()
      .then(setSessions)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(session: Omit<TrainingSession, "id">) {
    setError(null);
    try {
      const created = await insertSession(session);
      setSessions((prev) => [created, ...prev]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add session");
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    const previous = sessions;
    setSessions((prev) => prev.filter((s) => s.id !== id));
    try {
      await deleteSession(id);
    } catch (e) {
      setSessions(previous);
      setError(e instanceof Error ? e.message : "Failed to delete session");
    }
  }

  return (
    <div className="min-h-screen bg-canvas">
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10 sm:px-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <Link
              href="/"
              className="text-sm text-ink-muted hover:text-clay hover:underline"
            >
              ← Back to week
            </Link>
            <h1 className="font-sans text-2xl font-semibold tracking-tight text-ink">
              Session history
            </h1>
            <p className="font-serif text-sm text-ink-muted">
              Log anything that wasn't on the week's plan.
            </p>
          </div>
        </header>

        {error && (
          <div className="rounded-lg border border-clay/30 bg-clay/10 px-4 py-2 text-sm text-clay-strong">
            {error}
          </div>
        )}

        <StatsBar sessions={sessions} />
        <SessionForm onAdd={handleAdd} />
        {loading ? (
          <p className="text-center font-serif text-sm text-ink-muted">
            Loading sessions…
          </p>
        ) : (
          <SessionList sessions={sessions} onDelete={handleDelete} />
        )}
      </main>
    </div>
  );
}
