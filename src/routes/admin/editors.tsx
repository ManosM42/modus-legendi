import { useEffect, useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/editors")({
  component: AdminEditorsPage,
});

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

interface AllowedEditor {
  email: string;
  note: string | null;
  created_at: string;
}

function AdminEditorsPage() {
  const { isAdmin, loading: authLoading, user } = useAuth();
  const [entries, setEntries] = useState<AllowedEditor[]>([]);
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAdmin) void loadEntries();
  }, [authLoading, isAdmin]);

  const loadEntries = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("allowed_editors")
      .select("email, note, created_at")
      .order("created_at", { ascending: false });
    setEntries((data as AllowedEditor[]) ?? []);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const { error } = await supabase.from("allowed_editors").insert({
      email: email.trim().toLowerCase(),
      note: note.trim() || null,
      invited_by: user?.id,
    });

    if (error) {
      setError(
        error.code === "23505"
          ? "Αυτό το email υπάρχει ήδη στη λίστα."
          : "Κάτι πήγε στραβά. Δοκίμασε ξανά.",
      );
    } else {
      setEmail("");
      setNote("");
      await loadEntries();
    }
    setSaving(false);
  };

  const handleRemove = async (targetEmail: string) => {
    await supabase.from("allowed_editors").delete().eq("email", targetEmail);
    await loadEntries();
  };

  if (authLoading) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <p className="text-sm text-muted-foreground">Δεν έχεις πρόσβαση σε αυτή τη σελίδα.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
          Admin
        </p>
        <h1 className="mt-2 font-display text-3xl text-foreground">Μέλη ομάδας</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Πρόσθεσε το email κάποιου εδώ ώστε, μόλις κάνει sign-in με Google,
          να γίνει αυτόματα editor και να μπορεί να ανεβάζει άρθρα. Δεν
          χρειάζεται να στείλεις κάποιο invite email — απλά μπαίνει κανονικά.
        </p>

        <form onSubmit={handleAdd} className="mt-8 space-y-4 rounded-xl border border-border bg-card p-5">
          <div>
            <label htmlFor="editor-email" className="block text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="editor-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="georgia@example.com"
              className={cn(
                "mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground",
                focusRing,
              )}
            />
          </div>
          <div>
            <label htmlFor="editor-note" className="block text-sm font-medium text-foreground">
              Σημείωση (προαιρετικό)
            </label>
            <input
              id="editor-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="π.χ. νέο μέλος, μεταφράστρια"
              className={cn(
                "mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground",
                focusRing,
              )}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className={cn(
              "rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60",
              focusRing,
            )}
          >
            {saving ? "Προσθήκη…" : "Προσθήκη μέλους"}
          </button>
        </form>

        <div className="mt-10">
          <h2 className="text-sm font-medium text-foreground">
            {loading ? "Φόρτωση…" : `${entries.length} email στη λίστα`}
          </h2>
          <ul className="mt-3 divide-y divide-border rounded-xl border border-border bg-card">
            {entries.map((entry) => (
              <li key={entry.email} className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-sm text-foreground">{entry.email}</p>
                  {entry.note && (
                    <p className="text-xs text-muted-foreground">{entry.note}</p>
                  )}
                </div>
                <button
                  onClick={() => handleRemove(entry.email)}
                  className={cn(
                    "text-xs font-medium text-destructive hover:underline",
                    focusRing,
                  )}
                >
                  Αφαίρεση
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}