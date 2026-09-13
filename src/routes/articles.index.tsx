import { useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useI18n } from "@/i18n";
import { articles, sectionOrder, topicLabels, topics, type SectionId } from "@/data/content";
import { ArticleCard } from "@/components/site/ArticleCard";
import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/Reveal";
import { cn } from "@/lib/utils";

type SortKey = "newest" | "oldest" | "title";

type MagazineSearch = {
  section?: SectionId | "all";
  topic?: string;
  sort?: SortKey;
  page?: number;
};

const PER_PAGE = 6;

export const Route = createFileRoute("/articles/")({
  validateSearch: (search: Record<string, unknown>): MagazineSearch => ({
    section: (search['section'] as MagazineSearch["section"]) || "all",
    topic: (search['topic'] as string) || "all",
    sort: (search['sort'] as SortKey) || "newest",
    page: Number(search['page']) > 0 ? Number(search['page']) : 1,
  }),
  head: () => ({
    meta: [
      { title: "Περιοδικό — MODUS LEGENDI" },
      {
        name: "description",
        content:
          "Δοκίμια, κριτικές βιβλίου, μεταφράσεις και συνεντεύξεις από τη σύνταξη του MODUS LEGENDI.",
      },
      { property: "og:title", content: "Περιοδικό — MODUS LEGENDI" },
      {
        property: "og:description",
        content: "Κείμενα για την ανάγνωση, τη μορφή και τη μετάφραση.",
      },
    ],
  }),
  component: MagazinePage,
});

function MagazinePage() {
  const { locale, t } = useI18n();
  const navigate = useNavigate({ from: "/magazine/" });
  const search = Route.useSearch();

  const section = search.section ?? "all";
  const topic = search.topic ?? "all";
  const sort: SortKey = search.sort ?? "newest";
  const page = search.page ?? 1;

  const filtered = useMemo(() => {
    const list = articles.filter(
      (article) =>
        (section === "all" || article.section === section) &&
        (topic === "all" || article.topics.includes(topic)),
    );
    const sorted = [...list];
    if (sort === "oldest") sorted.sort((a, b) => a.date.localeCompare(b.date));
    else if (sort === "title")
      sorted.sort((a, b) => a.title[locale].localeCompare(b.title[locale], locale));
    else sorted.sort((a, b) => b.date.localeCompare(a.date));
    return sorted;
  }, [section, topic, sort, locale]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const update = (next: Partial<MagazineSearch>) => {
    navigate({
      search: (prev) => ({ ...prev, ...next, page: next.page ?? 1 }),
      resetScroll: false,
    });
  };

  return (
    <div>
      <PageHeader kicker={t.home.heroKicker} title={t.magazine.title} intro={t.magazine.intro} />

      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <fieldset className="border-t border-border pt-4">
              <legend className="rule-label">{t.magazine.filterSection}</legend>
              <div className="mt-3 flex flex-wrap gap-2 lg:flex-col lg:items-start">
                <FilterButton
                  active={section === "all"}
                  onClick={() => update({ section: "all" })}
                  label={t.magazine.filterAll}
                />
                {sectionOrder.map((item) => (
                  <FilterButton
                    key={item}
                    active={section === item}
                    onClick={() => update({ section: item })}
                    label={t.sections[item]}
                  />
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-8 border-t border-border pt-4">
              <legend className="rule-label">{t.magazine.filterTopic}</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                <FilterButton
                  active={topic === "all"}
                  onClick={() => update({ topic: "all" })}
                  label={t.magazine.filterAll}
                />
                {topics.map((item) => (
                  <FilterButton
                    key={item}
                    active={topic === item}
                    onClick={() => update({ topic: item })}
                    label={topicLabels[item]?.[locale] ?? item}
                  />
                ))}
              </div>
            </fieldset>

            <div className="mt-8 border-t border-border pt-4">
              <label htmlFor="magazine-sort" className="rule-label">
                {t.magazine.sort}
              </label>
              <select
                id="magazine-sort"
                value={sort}
                onChange={(event) => update({ sort: event.target.value as SortKey })}
                className="mt-3 w-full border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-accent"
              >
                <option value="newest">{t.magazine.sortNewest}</option>
                <option value="oldest">{t.magazine.sortOldest}</option>
                <option value="title">{t.magazine.sortTitle}</option>
              </select>
            </div>

            {section !== "all" || topic !== "all" || sort !== "newest" ? (
              <button
                type="button"
                onClick={() => update({ section: "all", topic: "all", sort: "newest" })}
                className="mt-6 rule-label text-accent underline-offset-4 hover:underline"
              >
                {t.actions.clear}
              </button>
            ) : null}
          </aside>

          <section>
            <p className="rule-label border-b border-border pb-3">
              {filtered.length} {t.magazine.results}
            </p>

            {visible.length === 0 ? (
              <p className="mt-10 text-base text-muted-foreground">{t.magazine.noResults}</p>
            ) : (
              <div className="mt-8 grid gap-6 md:grid-cols-2">
                {visible.map((article, index) => (
                  <Reveal key={article.slug} delay={index * 60}>
                    <ArticleCard article={article} />
                  </Reveal>
                ))}
              </div>
            )}

            {totalPages > 1 ? (
              <nav
                aria-label={t.magazine.title}
                className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6"
              >
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => update({ page: currentPage - 1 })}
                  className="border border-border px-4 py-2 text-sm transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t.actions.previous}
                </button>
                <ul className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
                    <li key={number}>
                      <button
                        type="button"
                        aria-current={number === currentPage ? "page" : undefined}
                        onClick={() => update({ page: number })}
                        className={cn(
                          "size-9 border text-sm transition-colors",
                          number === currentPage
                            ? "border-foreground bg-foreground text-background"
                            : "border-border hover:bg-secondary",
                        )}
                      >
                        {number}
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => update({ page: currentPage + 1 })}
                  className="border border-border px-4 py-2 text-sm transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t.actions.next}
                </button>
              </nav>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "border px-3 py-1.5 text-sm transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
