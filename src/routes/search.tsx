import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { useI18n } from "@/i18n";
import { supabase } from "@/supabase/client";
import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/Reveal";
import { TiltCard } from "@/components/site/TiltCard";
import type { ArticleWithRelations } from "@/lib/types";

function formatDate(iso: string | null, locale: string): string {
  if (!iso) return "";
  const localeTag = locale === "el" ? "el-GR" : locale === "de" ? "de-DE" : "en-US";
  return new Date(iso).toLocaleDateString(localeTag, { day: "numeric", month: "long", year: "numeric" });
}

function excerpt(text: string, maxLength = 130): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  return clean.slice(0, maxLength).replace(/\s+\S*$/, "") + "…";
}

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search["q"] === "string" ? (search["q"] as string) : "",
  }),
  head: () => ({
    meta: [
      { title: "Αναζήτηση — MODUS LEGENDI" },
      { name: "description", content: "Αναζητήστε κείμενα, συγγραφείς και θέματα στο αρχείο του MODUS LEGENDI." },
      { property: "og:title", content: "Αναζήτηση — MODUS LEGENDI" },
      { property: "og:description", content: "Αναζήτηση στο αρχείο κειμένων." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { locale, t } = useI18n();
  const navigate = useNavigate({ from: "/search" });
  const { q } = Route.useSearch();
  const [term, setTerm] = useState(q);
  const [allArticles, setAllArticles] = useState<ArticleWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTerm(q);
  }, [q]);

  useEffect(() => {
    void loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("articles")
      .select("*, author:profiles(id, username, name, avatar_url), column:columns(id, slug, name)")
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
    setAllArticles((data as unknown as ArticleWithRelations[]) ?? []);
    setLoading(false);
  };

  const normalized = q.trim().toLowerCase();
  const results = useMemo(() => {
    if (normalized.length < 2) return [];
    return allArticles.filter((article) =>
      [article.title, article.subtitle ?? "", article.author?.name ?? "", article.column?.name ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [allArticles, normalized]);

  return (
    <div>
      <PageHeader kicker={t.brand} title={t.search.title}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            navigate({ search: { q: term } });
          }}
          className="grid max-w-xl gap-3 sm:grid-cols-[minmax(0,1fr)_auto]"
        >
          <label htmlFor="search-input" className="sr-only">
            {t.search.placeholder}
          </label>
          <input
            id="search-input"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder={t.search.placeholder}
            className="min-w-0 border border-input bg-background px-4 py-3 text-sm outline-none focus-visible:border-accent"
          />
          <button
            type="submit"
            className="bg-foreground px-5 py-3 text-sm tracking-wide text-background transition-opacity hover:opacity-90"
          >
            {t.actions.search}
          </button>
        </form>
      </PageHeader>

      <section className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        {normalized.length < 2 ? (
          <p className="text-base text-muted-foreground">{t.search.start}</p>
        ) : loading ? (
          <p className="text-base text-muted-foreground">{t.actions.loading}</p>
        ) : (
          <>
            <p className="rule-label border-b border-border pb-3">
              {t.search.resultsFor} “{q}” · {results.length} {t.search.count}
            </p>
            {results.length === 0 ? (
              <p className="mt-8 text-base text-muted-foreground">{t.search.empty}</p>
            ) : (
              <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {results.map((article, index) => {
                  const photo = article.cover_url ?? article.secondary_photo_url ?? null;
                  return (
                    <Reveal key={article.id} delay={index * 60}>
                      <TiltCard>
                        <Link
                          to="/article/$articleId"
                          params={{ articleId: article.id }}
                          className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/5"
                        >
                          <div className="aspect-[16/10] overflow-hidden bg-secondary">
                            {photo ? (
                              <img
                                src={photo}
                                alt=""
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <BookOpen aria-hidden className="size-8 text-muted-foreground/40" />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-1 flex-col p-5">
                            <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-accent">
                              {article.column?.name} · {formatDate(article.published_at, locale)}
                            </p>
                            <h3 className="mt-2 font-display text-xl leading-snug text-foreground transition-colors group-hover:text-accent">
                              {article.title}
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground/90">
                              {excerpt(article.content)}
                            </p>
                            <div className="mt-auto flex items-center gap-2 pt-5">
                              {article.author?.avatar_url ? (
                                <img
                                  src={article.author.avatar_url}
                                  alt={article.author.name}
                                  className="size-6 rounded-full border border-border object-cover"
                                />
                              ) : (
                                <span className="flex size-6 items-center justify-center rounded-full bg-accent text-[0.6rem] font-semibold text-accent-foreground">
                                  {article.author?.name?.charAt(0).toUpperCase()}
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground">{article.author?.name}</span>
                            </div>
                          </div>
                        </Link>
                      </TiltCard>
                    </Reveal>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}