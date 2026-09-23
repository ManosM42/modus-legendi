import { createFileRoute, Link } from "@tanstack/react-router";
import { Scale } from "lucide-react";
import { useI18n } from "@/i18n";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Όροι Χρήσης — MODUS LEGENDI" },
      {
        name: "description",
        content: "Οι όροι χρήσης του MODUS LEGENDI: πνευματική ιδιοκτησία, λογαριασμοί, αποδεκτή χρήση.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  const { t } = useI18n();
  const sections = t.terms.sections;

  return (
    <div className="relative overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[380px] opacity-50"
        style={{
          background:
            "radial-gradient(50% 60% at 20% 0%, hsl(var(--accent) / 0.14), transparent 65%), radial-gradient(40% 45% at 90% 10%, hsl(var(--accent) / 0.08), transparent 60%)",
        }}
      />

      <header className="border-b border-border paper-grain">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-24">
          <Reveal>
            <p className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent">
              <Scale aria-hidden className="size-3.5" />
              {t.terms.kicker}
            </p>
            <h1 className="mt-4 text-balance font-display text-4xl leading-tight text-foreground sm:text-5xl">
              {t.terms.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
              {t.terms.intro}
            </p>
            <p className="mt-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              {t.terms.lastUpdated}
            </p>
          </Reveal>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
        {/* Table of contents */}
        <aside className="hidden lg:sticky lg:top-28 lg:block lg:h-max lg:self-start">
          <p className="rule-label">{t.terms.tocTitle}</p>
          <nav className="mt-4">
            <ol className="grid gap-2.5">
              {sections.map((section, i) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-accent hover:underline"
                  >
                    {i + 1}. {section.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        {/* Body */}
        <article className="max-w-3xl">
          <div className="space-y-12">
            {sections.map((section, i) => (
              <Reveal key={section.id} delay={Math.min(i * 40, 300)}>
                <section id={section.id} className="scroll-mt-28 border-t border-border pt-8 first:border-t-0 first:pt-0">
                  <h2 className="font-display text-2xl text-foreground sm:text-3xl">
                    <span className="mr-3 font-mono text-base text-accent">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {section.heading}
                  </h2>
                  <div className="mt-4 space-y-4">
                    {section.body.map((paragraph, pIdx) => (
                      <p key={pIdx} className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              </Reveal>
            ))}
          </div>

          <div className="mt-16 rounded-2xl border border-accent/30 bg-accent/5 p-6 sm:p-8">
            <p className="text-sm leading-relaxed text-foreground">{t.terms.closing}</p>
            <Link
              to="/contact"
              className="mt-4 inline-flex items-center text-sm font-medium text-accent underline-offset-4 hover:underline"
            >
              {t.terms.contactLink}
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}