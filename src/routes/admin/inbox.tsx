import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/supabase/client";
import { Reveal } from "@/components/site/Reveal";
import { cn } from "@/lib/utils";
import {
  Mail,
  FileText,
  Inbox as InboxIcon,
  Archive,
  CircleDot,
  ChevronDown,
  Trash2,
} from "lucide-react";
import type { ContactSubmission, Submission } from "@/lib/types";

export const Route = createFileRoute("/admin/inbox")({
  component: AdminInboxPage,
});

/** Unified shape so contact_submissions and submissions can render in one list. */
type InboxItem =
  | { source: "contact"; data: ContactSubmission }
  | { source: "submission"; data: Submission };

const typeLabels: Record<Submission["type"], string> = {
  essay: "Δοκίμιο",
  review: "Κριτική",
  translation: "Μετάφραση",
  interview: "Συνέντευξη",
};

const languageLabels: Record<Submission["language"], string> = {
  el: "Ελληνικά",
  en: "English",
  de: "Deutsch",
};

function AdminInboxPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [items, setItems] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "new" | "archived">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAdmin) void loadInbox();
  }, [authLoading, isAdmin]);

  const loadInbox = async () => {
    setLoading(true);
    const [contactRes, submissionRes] = await Promise.all([
      supabase.from("contact_submissions").select("*").order("created_at", { ascending: false }),
      supabase.from("submissions").select("*").order("created_at", { ascending: false }),
    ]);

    const contactItems: InboxItem[] = ((contactRes.data as ContactSubmission[]) ?? []).map(
      (data) => ({ source: "contact", data }),
    );
    const submissionItems: InboxItem[] = ((submissionRes.data as Submission[]) ?? []).map(
      (data) => ({ source: "submission", data }),
    );

    const merged = [...contactItems, ...submissionItems].sort(
      (a, b) => new Date(b.data.created_at).getTime() - new Date(a.data.created_at).getTime(),
    );

    setItems(merged);
    setLoading(false);
  };

  const markStatus = async (item: InboxItem, status: "read" | "archived") => {
    const table = item.source === "contact" ? "contact_submissions" : "submissions";
    await supabase.from(table).update({ status }).eq("id", item.data.id);
    setItems((prev) =>
      prev.map((it) =>
        it.data.id === item.data.id && it.source === item.source
          ? { ...it, data: { ...it.data, status } }
          : it,
      ),
    );
  };

  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  /** Permanently removes the row from the database — works for new,
   * read, or archived items alike, from any filter tab. */
  const deleteItem = async (item: InboxItem) => {
    const confirmed = window.confirm(
      "Οριστική διαγραφή αυτού του μηνύματος; Δεν μπορεί να αναιρεθεί.",
    );
    if (!confirmed) return;

    const key = `${item.source}:${item.data.id}`;
    setDeletingKey(key);

    const table = item.source === "contact" ? "contact_submissions" : "submissions";
    const { error } = await supabase.from(table).delete().eq("id", item.data.id);

    if (!error) {
      setItems((prev) =>
        prev.filter((it) => !(it.data.id === item.data.id && it.source === item.source)),
      );
      if (expandedId === key) setExpandedId(null);
    }
    setDeletingKey(null);
  };

  const toggleExpand = (item: InboxItem) => {
    const key = `${item.source}:${item.data.id}`;
    const wasExpanded = expandedId === key;
    setExpandedId(wasExpanded ? null : key);
    if (!wasExpanded && item.data.status === "new") {
      void markStatus(item, "read");
    }
  };

  const filtered = useMemo(() => {
    if (filter === "all") return items.filter((i) => i.data.status !== "archived");
    return items.filter((i) => i.data.status === filter);
  }, [items, filter]);

  const newCount = items.filter((i) => i.data.status === "new").length;

  if (authLoading) return <div className="min-h-screen bg-background" />;

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Δεν έχεις πρόσβαση σε αυτή τη σελίδα.</p>
          <Link
            to="/"
            className="mt-4 inline-block font-mono text-xs uppercase tracking-widest text-accent hover:underline"
          >
            Επιστροφή στην αρχική
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-4 py-12 sm:px-8 sm:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[380px] opacity-50"
        style={{
          background:
            "radial-gradient(50% 60% at 20% 0%, hsl(var(--accent) / 0.14), transparent 65%)",
        }}
      />

      <div className="mx-auto max-w-4xl">
        <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent">
              <InboxIcon className="size-3.5" />
              Inbox
            </p>
            <h1 className="mt-2 font-display text-4xl text-foreground sm:text-5xl">
              Μηνύματα
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Επικοινωνία + Υποβολές κειμένων, σε μία λίστα.
            </p>
          </div>
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 self-start rounded-lg border border-border bg-card px-4 py-2 font-mono text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            ← Admin Dashboard
          </Link>
        </header>

        {/* Filter tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {(
            [
              { key: "all", label: "Όλα" },
              { key: "new", label: `Νέα${newCount > 0 ? ` (${newCount})` : ""}` },
              { key: "archived", label: "Αρχειοθετημένα" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={cn(
                "rounded-full border px-4 py-2 text-xs font-mono uppercase tracking-wider transition-colors",
                filter === tab.key
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl border border-border bg-card/50" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
            Δεν υπάρχουν μηνύματα εδώ.
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((item, i) => {
              const key = `${item.source}:${item.data.id}`;
              const isExpanded = expandedId === key;
              const isNew = item.data.status === "new";
              const isArchived = item.data.status === "archived";

              return (
                <Reveal key={key} delay={i * 40}>
                  <li
                    className={cn(
                      "overflow-hidden rounded-2xl border bg-card transition-colors",
                      isNew ? "border-accent/50" : "border-border",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => toggleExpand(item)}
                      className="flex w-full items-start gap-4 p-5 text-left"
                    >
                      <div
                        className={cn(
                          "mt-1 flex size-9 shrink-0 items-center justify-center rounded-full",
                          item.source === "contact"
                            ? "bg-accent/10 text-accent"
                            : "bg-secondary text-foreground",
                        )}
                      >
                        {item.source === "contact" ? (
                          <Mail className="size-4" />
                        ) : (
                          <FileText className="size-4" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {isNew && (
                            <CircleDot className="size-2.5 shrink-0 fill-accent text-accent" />
                          )}
                          <p className="truncate text-sm font-medium text-foreground">
                            {item.data.name}
                          </p>
                          <span className="font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
                            {item.source === "contact"
                              ? item.data.wants_to_submit_text
                                ? "Επικοινωνία · θέλει να στείλει κείμενο"
                                : "Επικοινωνία"
                              : `Υποβολή · ${typeLabels[item.data.type]}`}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {item.data.email}
                        </p>
                        {!isExpanded && (
                          <p className="mt-2 line-clamp-1 text-sm text-muted-foreground/90">
                            {item.source === "contact" ? item.data.message : item.data.abstract}
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <time className="text-[0.65rem] text-muted-foreground">
                          {new Date(item.data.created_at).toLocaleDateString("el-GR", {
                            day: "numeric",
                            month: "short",
                          })}
                        </time>
                        <ChevronDown
                          className={cn(
                            "size-4 text-muted-foreground transition-transform",
                            isExpanded && "rotate-180",
                          )}
                        />
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-border px-5 pb-5 pt-4">
                        {/* Full sender contact details */}
                        <dl className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
                          <div>
                            <dt className="font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
                              Όνομα
                            </dt>
                            <dd className="mt-0.5 text-foreground">{item.data.name}</dd>
                          </div>
                          <div>
                            <dt className="font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
                              Email
                            </dt>
                            <dd className="mt-0.5">
                              <a
                                href={`mailto:${item.data.email}`}
                                className="text-accent hover:underline"
                              >
                                {item.data.email}
                              </a>
                            </dd>
                          </div>
                          {item.source === "submission" && (
                            <>
                              <div>
                                <dt className="font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
                                  Τίτλος
                                </dt>
                                <dd className="mt-0.5 text-foreground">{item.data.title}</dd>
                              </div>
                              <div>
                                <dt className="font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
                                  Γλώσσα
                                </dt>
                                <dd className="mt-0.5 text-foreground">
                                  {languageLabels[item.data.language]}
                                </dd>
                              </div>
                            </>
                          )}
                        </dl>

                        {/* Full message */}
                        <div className="mt-4 rounded-xl bg-secondary/50 p-4">
                          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                            {item.source === "contact" ? item.data.message : item.data.abstract}
                          </p>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <a
                            href={`mailto:${item.data.email}`}
                            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-xs font-mono uppercase tracking-wider text-foreground transition-colors hover:bg-secondary"
                          >
                            <Mail className="size-3.5" />
                            Απάντηση
                          </a>
                          {!isArchived && (
                            <button
                              onClick={() => markStatus(item, "archived")}
                              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-xs font-mono uppercase tracking-wider text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                            >
                              <Archive className="size-3.5" />
                              Αρχειοθέτηση
                            </button>
                          )}
                          <button
                            onClick={() => deleteItem(item)}
                            disabled={deletingKey === key}
                            className="ml-auto inline-flex items-center gap-2 rounded-lg border border-destructive/30 px-4 py-2 text-xs font-mono uppercase tracking-wider text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
                          >
                            <Trash2 className="size-3.5" />
                            {deletingKey === key ? "Διαγραφή…" : "Διαγραφή"}
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                </Reveal>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}