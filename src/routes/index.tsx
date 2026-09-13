import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, Check } from "lucide-react";
import { useI18n } from "@/i18n";
import {
  articles,
  currentBook,
  formatDate,
  meetings,
  sectionBlurbs,
  sectionOrder,
  stats,
} from "@/data/content";
import { ArticleCard } from "@/components/site/ArticleCard";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MODUS LEGENDI — Λέσχη ανάγνωσης & περιοδικό λόγου" },
      {
        name: "description",
        content:
          "Λέσχη ανάγνωσης και ανεξάρτητο περιοδικό λόγου: δοκίμια, κριτικές, μεταφράσεις και συναντήσεις δύο φορές τον μήνα.",
      },
      { property: "og:title", content: "MODUS LEGENDI — Λέσχη ανάγνωσης & περιοδικό λόγου" },
      {
        property: "og:description",
        content: "Δοκίμια, κριτικές, μεταφράσεις και συναντήσεις ανάγνωσης στην Αθήνα.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { locale, t } = useI18n();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const featured = articles.filter((article) => article.featured);
  const latest = articles.slice(0, 6);
  const nextMeeting = meetings[0];

  return (
    <div>
      <section className="border-b border-border paper-grain">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.35fr_1fr] lg:gap-16">
          <Reveal>
            <p className="rule-label text-accent">{t.home.heroKicker}</p>
            <h1 className="mt-4 text-balance text-5xl leading-[1.02] sm:text-6xl md:text-7xl">
              {t.home.heroTitle}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t.home.heroText}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/magazine"
                className="inline-flex items-center gap-2 bg-foreground px-5 py-3 text-sm tracking-wide text-background transition-opacity hover:opacity-90"
              >
                {t.nav.magazine}
                <ArrowRight aria-hidden className="size-4" />
              </Link>
              <Link
                to="/reading-group"
                className="inline-flex items-center gap-2 border border-foreground px-5 py-3 text-sm tracking-wide transition-colors hover:bg-secondary"
              >
                {t.nav.readingGroup}
              </Link>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <aside className="border border-border bg-card p-6 sm:p-8">
              <p className="rule-label">{t.home.currentRead}</p>
              <h2 className="mt-3 text-3xl leading-tight">{currentBook.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {currentBook.author} · {currentBook.pages} p.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {currentBook.description[locale]}
              </p>
              {nextMeeting ? (
                <div className="mt-6 border-t border-border pt-5">
                  <p className="rule-label">{t.home.nextMeeting}</p>
                  <p className="mt-2 flex items-center gap-2 text-sm">
                    <CalendarDays aria-hidden className="size-4 shrink-0 text-accent" />
                    <span className="min-w-0">
                      {formatDate(nextMeeting.date, locale)} · {nextMeeting.time}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {nextMeeting.place[locale]}
                  </p>
                </div>
              ) : null}
            </aside>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 border-b border-border pb-4">
          <h2 className="min-w-0 text-3xl sm:text-4xl">{t.home.featured}</h2>
          <Link
            to="/magazine"
            className="rule-label shrink-0 text-accent underline-offset-4 hover:underline"
          >
            {t.actions.seeAll}
          </Link>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {featured.map((article, index) => (
            <Reveal key={article.slug} delay={index * 90}>
              <ArticleCard article={article} variant="feature" />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-secondary/40">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <h2 className="text-3xl sm:text-4xl">{t.home.sections}</h2>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            {t.home.sectionsText}
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sectionOrder.map((section, index) => (
              <Reveal key={section} delay={index * 70}>
                <Link
                  to="/magazine"
                  search={{ section }}
                  className="block h-full border border-border bg-card p-6 transition-colors hover:border-accent"
                >
                  <h3 className="text-2xl">{t.sections[section]}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {sectionBlurbs[section][locale]}
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 border-b border-border pb-4">
          <h2 className="min-w-0 text-3xl sm:text-4xl">{t.home.latest}</h2>
          <Link
            to="/magazine"
            className="rule-label shrink-0 text-accent underline-offset-4 hover:underline"
          >
            {t.actions.seeAll}
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {latest.map((article, index) => (
            <Reveal key={article.slug} delay={index * 60}>
              <ArticleCard article={article} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-foreground text-background">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
            <div>
              <h2 className="text-3xl sm:text-4xl">{t.home.manifestoTitle}</h2>
              <p className="mt-4 max-w-lg text-base leading-relaxed opacity-80">
                {t.home.manifestoText}
              </p>
            </div>
            <div>
              <p className="rule-label opacity-70">{t.home.numbersTitle}</p>
              <dl className="mt-5 grid grid-cols-2 gap-6">
                {stats.map((stat) => (
                  <div key={stat.key}>
                    <dt className="text-sm opacity-70">{t.home.stats[stat.key]}</dt>
                    <dd className="font-display text-4xl">{stat.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-8 border border-border bg-card p-6 sm:p-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl">{t.home.newsletterTitle}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {t.home.newsletterText}
            </p>
          </div>
          {subscribed ? (
            <p className="flex items-start gap-3 border border-accent/40 bg-accent/10 p-4 text-sm text-accent">
              <Check aria-hidden className="mt-0.5 size-4 shrink-0" />
              <span>{t.home.newsletterSuccess}</span>
            </p>
          ) : (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setSubscribed(true);
              }}
              className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]"
            >
              <label className="sr-only" htmlFor="home-newsletter-email">
                {t.home.emailPlaceholder}
              </label>
              <input
                id="home-newsletter-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t.home.emailPlaceholder}
                className="min-w-0 border border-input bg-background px-4 py-3 text-sm outline-none focus-visible:border-accent"
              />
              <button
                type="submit"
                className="bg-foreground px-5 py-3 text-sm tracking-wide text-background transition-opacity hover:opacity-90"
              >
                {t.actions.subscribe}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
