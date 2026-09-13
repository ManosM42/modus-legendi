import { Link } from "@tanstack/react-router";
import { useI18n } from "@/i18n";
import { formatDate, topicLabels, type Article } from "@/data/content";
import { cn } from "@/lib/utils";

export function ArticleCard({
  article,
  variant = "default",
}: {
  article: Article;
  variant?: "default" | "feature" | "compact";
}) {
  const { locale, t } = useI18n();
  const isFeature = variant === "feature";

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col border border-border bg-card p-6 transition-shadow duration-300 hover:shadow-[0_14px_40px_-28px_var(--color-foreground)]",
        isFeature && "sm:p-9",
      )}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="rule-label text-accent">{t.sections[article.section]}</span>
        <span aria-hidden className="text-border">
          |
        </span>
        <span className="rule-label">{formatDate(article.date, locale)}</span>
      </div>

      <h3
        className={cn(
          "mt-4 text-balance text-2xl leading-tight",
          isFeature ? "sm:text-4xl" : variant === "compact" ? "text-xl" : "sm:text-3xl",
        )}
      >
        <Link
          to="/magazine/$slug"
          params={{ slug: article.slug }}
          className="decoration-accent/60 underline-offset-4 transition-colors hover:text-accent hover:underline"
        >
          {article.title[locale]}
        </Link>
      </h3>

      {variant !== "compact" ? (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {article.dek[locale]}
        </p>
      ) : null}

      <div className="mt-auto pt-6">
        <p className="rule-label">
          {t.magazine.by} {article.author} · {article.readingTime} {t.magazine.minRead}
        </p>
        {variant === "feature" ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {article.topics.map((topic) => (
              <li
                key={topic}
                className="border border-border px-2.5 py-1 text-xs tracking-wide text-muted-foreground"
              >
                {topicLabels[topic]?.[locale] ?? topic}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}
