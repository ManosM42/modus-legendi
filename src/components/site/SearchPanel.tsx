import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { useI18n } from "@/i18n";
import { articles, formatDate } from "@/data/content";

export function SearchPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { locale, t } = useI18n();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (open) {
      setQuery("");
      const id = window.setTimeout(() => inputRef.current?.focus(), 60);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const root = dialogRef.current;
      if (!root) return;
      const focusable = Array.from(
        root.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.offsetParent !== null);
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !root.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [open, onClose]);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (term.length < 2) return [];
    return articles
      .filter((article) =>
        [article.title[locale], article.dek[locale], article.author, article.section]
          .join(" ")
          .toLowerCase()
          .includes(term),
      )
      .slice(0, 6);
  }, [query, locale]);

  if (!open) return null;

  const hasQuery = query.trim().length >= 2;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/40 px-4 py-16 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-2xl border border-border bg-card shadow-xl"
      >
        <h2 id={titleId} className="sr-only">
          {t.search.title}
        </h2>
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-4 py-3">
          <Search aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.actions.searchPlaceholder}
            aria-label={t.search.title}
            aria-describedby={`${titleId}-status`}
            className="min-w-0 bg-transparent py-1 text-base outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label={t.nav.close}
            className="shrink-0 p-2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>

        <p id={`${titleId}-status`} role="status" aria-live="polite" className="sr-only">
          {hasQuery ? `${results.length} ${t.search.count}` : t.search.start}
        </p>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {!hasQuery ? (
            <p className="px-3 py-6 text-sm text-muted-foreground">{t.search.start}</p>
          ) : results.length === 0 ? (
            <p className="px-3 py-6 text-sm text-muted-foreground">{t.search.empty}</p>
          ) : (
            <ul aria-label={t.a11y.searchResults}>
              {results.map((article) => (
                <li key={article.slug}>
                  <Link
                    to="/magazine/$slug"
                    params={{ slug: article.slug }}
                    onClick={onClose}
                    className="block px-3 py-3 transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
                  >
                    <span className="rule-label text-accent">{t.sections[article.section]}</span>
                    <span className="mt-1 block font-display text-lg leading-snug">
                      {article.title[locale]}
                    </span>
                    <span className="rule-label">{formatDate(article.date, locale)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-border px-4 py-3">
          <Link
            to="/search"
            search={{ q: query }}
            onClick={onClose}
            className="rule-label text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {t.search.title} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
