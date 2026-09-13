import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/i18n";
import { stats, team, timeline } from "@/data/content";
import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Ταυτότητα — MODUS LEGENDI" },
      {
        name: "description",
        content:
          "Η ιστορία, οι αρχές και η συντακτική ομάδα του MODUS LEGENDI, από τον κύκλο ανάγνωσης του 2019 στο περιοδικό λόγου.",
      },
      { property: "og:title", content: "Ταυτότητα — MODUS LEGENDI" },
      { property: "og:description", content: "Αρχές, χρονολόγιο και συντακτική ομάδα." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { locale, t } = useI18n();

  return (
    <div>
      <PageHeader kicker={t.brand} title={t.about.title} intro={t.about.intro} />

      <section className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <h2 className="text-3xl sm:text-4xl">{t.about.valuesTitle}</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {t.about.values.map((value, index) => (
            <Reveal key={value.title} delay={index * 80}>
              <div className="h-full border border-border bg-card p-6">
                <h3 className="text-2xl">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{value.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-secondary/40">
        <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
          <h2 className="text-3xl sm:text-4xl">{t.about.timelineTitle}</h2>
          <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {timeline.map((entry) => (
              <li key={entry.year} className="border-t border-foreground/30 pt-4">
                <span className="font-display text-3xl">{entry.year}</span>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {entry.text[locale]}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <h2 className="text-3xl sm:text-4xl">{t.about.teamTitle}</h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member, index) => (
            <Reveal key={member.name} delay={index * 70}>
              <li className="h-full border border-border bg-card p-6">
                <span
                  aria-hidden
                  className="grid size-12 shrink-0 place-items-center border border-border font-display text-lg"
                >
                  {member.initials}
                </span>
                <h3 className="mt-4 text-xl leading-snug">{member.name}</h3>
                <p className="rule-label mt-1">{member.role[locale]}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {member.bio[locale]}
                </p>
              </li>
            </Reveal>
          ))}
        </ul>
      </section>

      <section className="border-t border-border bg-foreground text-background">
        <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-16">
          <p className="rule-label opacity-70">{t.home.numbersTitle}</p>
          <dl className="mt-6 grid grid-cols-2 gap-6 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.key}>
                <dt className="text-sm opacity-70">{t.home.stats[stat.key]}</dt>
                <dd className="font-display text-4xl">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  );
}
