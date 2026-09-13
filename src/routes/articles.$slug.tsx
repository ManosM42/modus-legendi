import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Link2 } from "lucide-react";
import { useI18n } from "@/i18n";
import { articles, formatDate, topicLabels } from "@/data/content";
import { ArticleCard } from "@/components/site/ArticleCard";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/articles/$slug")({
  loader: ({ params }) => {
    const article = articles.find((item) => item.slug === params.slug);
    if (!article) throw notFound();
    return { slug: article.slug, title: article.title.el, dek: article.dek.el };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Μη διαθέσιμο — MODUS LEGENDI" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.title} — MODUS LEGENDI`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.dek },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.dek },
        { property: "og:type", content: "article" },
      ],
    };
  },
  component: ArticlePage,
  notFoundComponent: ArticleMissing,
});

function ArticlePage() {
  const { locale, t } = useI18n();
  const { slug } = Route.useLoaderData();
  const article = articles.find((item) => item.slug === slug);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setShareUrl(window.location.href);
  }, [slug]);

  useEffect(() => {
    if (!copied) return undefined;
    const id = window.setTimeout(() => setCopied(false), 3000);
    return () => window.clearTimeout(id);
  }, [copied]);

  if (!article) return <ArticleMissing />;

  const related = articles
    .filter(
      (item) =>
        item.slug !== article.slug &&
        (item.section === article.section ||
          item.topics.some((topic) => article.topics.includes(topic))),
    )
    .slice(0, 3);

  const toc = [
    { id: "article-body", label: t.a11y.articleBody },
    { id: "article-topics", label: t.a11y.topics },
    ...(related.length > 0 ? [{ id: "article-related", label: t.magazine.relatedTitle }] : []),
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl || window.location.href);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const focusRing =
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

  return (
    <div>
      <header className="border-b border-border bg-secondary/40 paper-grain">
        <div className="mx-auto w-full max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
          <Reveal>
            <nav aria-label={t.a11y.breadcrumb}>
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link
                    to="/"
                    className={`rule-label underline-offset-4 hover:underline ${focusRing}`}
                  >
                    {t.nav.home}
                  </Link>
                </li>
                <li aria-hidden="true" className="rule-label">
                  /
                </li>
                <li>
                  <Link
                    to="/magazine"
                    className={`rule-label text-accent underline-offset-4 hover:underline ${focusRing}`}
                  >
                    {t.nav.magazine}
                  </Link>
                </li>
                <li aria-hidden="true" className="rule-label">
                  /
                </li>
                <li className="rule-label" aria-current="page">
                  {t.sections[article.section]}
                </li>
              </ol>
            </nav>

            <Link
              to="/magazine"
              className={`rule-label mt-6 inline-flex items-center gap-2 text-accent underline-offset-4 hover:underline ${focusRing}`}
            >
              <ArrowLeft aria-hidden="true" className="size-3.5" />
              {t.nav.magazine}
            </Link>
            <p className="mt-6 rule-label">
              {t.sections[article.section]} <span aria-hidden="true">·</span>{" "}
              <time dateTime={article.date}>{formatDate(article.date, locale)}</time>
            </p>
            <h1 className="mt-3 text-balance text-4xl leading-[1.05] sm:text-5xl">
              {article.title[locale]}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              {article.dek[locale]}
            </p>
            <p className="mt-6 rule-label">
              {t.magazine.by} {article.author} <span aria-hidden="true">·</span>{" "}
              {article.readingTime} {t.magazine.minRead}
            </p>
          </Reveal>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <article aria-labelledby="article-body-heading" className="w-full max-w-3xl">
          <h2 id="article-body-heading" className="sr-only">
            {t.a11y.articleBody}
          </h2>
          <div id="article-body" className="space-y-6">
            {article.body[locale].map((paragraph, index) => (
              <p
                key={index}
                className="font-display text-xl leading-relaxed text-foreground sm:text-[1.4rem] sm:leading-[1.7]"
              >
                {paragraph}
              </p>
            ))}
          </div>

          <section aria-labelledby="article-topics-heading" className="mt-12 border-t border-border pt-8">
            <h2 id="article-topics-heading" className="rule-label">
              {t.a11y.topics}
            </h2>
            <ul id="article-topics" className="mt-4 flex flex-wrap gap-2">
              {article.topics.map((topic) => (
                <li key={topic}>
                  <Link
                    to="/magazine"
                    search={{ topic }}
                    className={`inline-flex border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-foreground hover:text-foreground ${focusRing}`}
                  >
                    {topicLabels[topic]?.[locale] ?? topic}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </article>

        <aside
          aria-labelledby="article-aside-heading"
          className="h-max border-t border-border pt-6 lg:sticky lg:top-28 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0"
        >
          <h2 id="article-aside-heading" className="rule-label">
            {t.a11y.onThisPage}
          </h2>
          <nav aria-label={t.a11y.onThisPage} className="mt-4">
            <ol className="grid gap-2">
              {toc.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={`text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline ${focusRing}`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <h3 className="rule-label mt-8">{t.magazine.shareTitle}</h3>
          <ul className="mt-4 grid gap-2">
            <li>
              <button
                type="button"
                onClick={copyLink}
                className={`inline-flex min-h-11 items-center gap-2 border border-border px-3 text-sm transition-colors hover:bg-secondary ${focusRing}`}
              >
                <Link2 aria-hidden="true" className="size-4" />
                {t.a11y.copyLink}
              </button>
            </li>
            <li>
              <a
                href={`mailto:?subject=${encodeURIComponent(article.title[locale])}&body=${encodeURIComponent(shareUrl)}`}
                className={`inline-flex min-h-11 items-center border border-border px-3 text-sm transition-colors hover:bg-secondary ${focusRing}`}
              >
                {`${t.a11y.shareOn} Email`}
              </a>
            </li>
          </ul>
          <p role="status" aria-live="polite" className="mt-3 text-sm text-muted-foreground">
            {copied ? t.a11y.linkCopied : ""}
          </p>
        </aside>
      </div>

      {related.length > 0 ? (
        <section aria-labelledby="article-related" className="border-t border-border bg-secondary/40">
          <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-16">
            <h2 id="article-related" className="text-3xl">
              {t.magazine.relatedTitle}
            </h2>
            <ul className="mt-8 grid list-none gap-6 md:grid-cols-3">
              {related.map((item, index) => (
                <li key={item.slug}>
                  <Reveal delay={index * 70}>
                    <ArticleCard article={item} variant="compact" />
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function ArticleMissing() {
  const { t } = useI18n();
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-24 text-center sm:px-8">
      <h1 className="text-4xl">{t.magazine.notFound}</h1>
      <Link
        to="/magazine"
        className="mt-8 inline-flex border border-foreground px-5 py-3 text-sm transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {t.nav.magazine}
      </Link>
    </div>
  );
}

