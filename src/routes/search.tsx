import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useI18n } from "@/i18n";
import { articles } from "@/data/content";
import { ArticleCard } from "@/components/site/ArticleCard";
import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search['q'] === "string" ? (search['q'] as string) : "",
  }),
  head: () => ({
    meta: [
      { title: "Αναζήτηση — MODUS LEGENDI" },
      {
        name: "description",
        content: "Αναζητήστε κείμενα, συγγραφείς και θέματα στο αρχείο του MODUS LEGENDI.",
      },
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

  const normalized = q.trim().toLowerCase();
  const results =
    normalized.length < 2
      ? []
      : articles.filter((article) =>
          [article.title[locale], article.dek[locale], article.author, article.section]
            .join(" ")
            .toLowerCase()
            .includes(normalized),
        );

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
        ) : (
          <>
            <p className="rule-label border-b border-border pb-3">
              {t.search.resultsFor} “{q}” · {results.length} {t.search.count}
            </p>
            {results.length === 0 ? (
              <p className="mt-8 text-base text-muted-foreground">{t.search.empty}</p>
            ) : (
              <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {results.map((article, index) => (
                  <Reveal key={article.slug} delay={index * 60}>
                    <ArticleCard article={article} />
                  </Reveal>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
