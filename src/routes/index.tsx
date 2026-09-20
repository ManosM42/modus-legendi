import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Feather, PenLine, SquarePen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n";
import { supabase } from "@/supabase/client";
import { cn } from "@/lib/utils";
import {
  sectionBlurbs,
  sectionOrder,
  team,
} from "@/data/content";
import { Reveal } from "@/components/site/Reveal";
import { TiltCard } from "@/components/site/TiltCard";
import modusLogo from "@/assets/modus-logo.jpg";
import type { ArticleWithRelations } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MODUS LEGENDI — Ένας χώρος για τη λογοτεχνία, την ανάγνωση και τη σκέψη." },
      {
        name: "description",
        content: "Λέσχη ανάγνωσης και ανεξάρτητο περιοδικό λόγου: δοκίμια, κριτικές, μεταφράσεις και συναντήσεις.",
      },

    ],
  }),
  component: HomePage,
});

/** Strips whitespace/newlines and trims content to a short reading preview. */
function excerpt(text: string, maxLength = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  return clean.slice(0, maxLength).replace(/\s+\S*$/, "") + "…";
}

function HomePage() {
  const { session, loading } = useAuth();
  const { locale, t } = useI18n();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 rounded-full border-4 border-t-transparent animate-spin border-accent" />
      </div>
    );
  }

  return session ? (
    <LoggedInView locale={locale} t={t} />
  ) : (
    <LoggedOutView locale={locale} t={t} />
  );
}

/* =========================================================
   LOGGED OUT VIEW — Premium Editorial Landing Page
   ========================================================= */

function LoggedOutView({ locale, t }: { locale: string; t: any }) {
  const [latestArticle, setLatestArticle] = useState<ArticleWithRelations | null>(null);
  const [latestLoading, setLatestLoading] = useState(true);

  useEffect(() => {
    void loadLatest();
  }, []);

  const loadLatest = async () => {
    setLatestLoading(true);
    const { data } = await supabase
      .from("articles")
      .select("*, author:profiles(id, username, name, avatar_url), column:columns(id, slug, name)")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setLatestArticle((data as unknown as ArticleWithRelations) ?? null);
    setLatestLoading(false);
  };

  return (
    <div className="overflow-hidden bg-background">
      <HeroSection locale={locale} t={t} latestArticle={latestArticle} latestLoading={latestLoading} />
      <ManifestoSection locale={locale} t={t} />
      <PillarsSection locale={locale} t={t} />
      <FeaturedTeamSection locale={locale} t={t} />
      <FinalCTASection locale={locale} t={t} />
    </div>
  );
}

function HeroSection({
  locale,
  t,
  latestArticle,
  latestLoading,
}: {
  locale: string;
  t: any;
  latestArticle: ArticleWithRelations | null;
  latestLoading: boolean;
}) {
  const photo = latestArticle?.cover_url ?? latestArticle?.secondary_photo_url ?? null;

  return (
    <section className="relative border-b border-border paper-grain">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{
          background:
            "radial-gradient(60% 50% at 20% 10%, hsl(var(--accent) / 0.15), transparent 60%), radial-gradient(50% 40% at 90% 30%, hsl(var(--accent) / 0.10), transparent 60%)",
        }}
      />
      <div className="mx-auto grid w-full max-w-6xl gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <Reveal>
          <img src={modusLogo} alt="Modus Legendi" className="h-12 w-auto sm:h-14" />
          <p className="mt-8 font-mono text-xs uppercase tracking-[0.2em] text-accent font-bold">
            {t.home.heroKicker}
          </p>
          <h1 className="mt-4 text-balance font-display text-5xl leading-[1.05] text-foreground sm:text-6xl md:text-7xl">
            {t.home.heroTitle}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t.home.heroText}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/login"
              className="group inline-flex items-center gap-2 bg-foreground px-6 py-3.5 text-sm tracking-wide text-background transition-transform hover:-translate-y-0.5"
            >
              {t.actions.signIn || "Συνδέσου για να διαβάσεις"}
              <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 border border-foreground px-6 py-3.5 text-sm tracking-wide text-foreground transition-colors hover:bg-secondary"
            >
              {t.nav.contact || "Επικοινωνία"}
            </Link>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <TiltCard>
            {latestLoading ? (
              <div className="relative aspect-[4/5] animate-pulse rounded-2xl border border-border bg-card" />
            ) : latestArticle ? (
              <Link
                to="/article/$articleId"
                params={{ articleId: latestArticle.id }}
                className="group relative flex aspect-[4/5] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
              >
                {photo ? (
                  <div className="relative h-2/5 w-full overflow-hidden">
                    <img
                      src={photo}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                  </div>
                ) : (
                  <div className="flex h-2/5 w-full items-center justify-center bg-secondary">
                    <BookOpen aria-hidden className="size-10 text-muted-foreground/40" />
                  </div>
                )}

                <div className="flex flex-1 flex-col p-8 sm:p-10">
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-accent font-bold">
                    Τελευταίο κείμενο · {latestArticle.column.name}
                  </p>
                  <h2 className="mt-3 font-display text-2xl leading-snug text-foreground group-hover:text-accent sm:text-3xl">
                    {latestArticle.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                    {excerpt(latestArticle.content, 160)}
                  </p>

                  <div className="mt-auto flex items-center gap-2 border-t border-border pt-5">
                    {latestArticle.author.avatar_url ? (
                      <img
                        src={latestArticle.author.avatar_url}
                        alt={latestArticle.author.name}
                        className="size-8 rounded-full object-cover border border-border"
                      />
                    ) : (
                      <span className="flex size-8 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-semibold">
                        {latestArticle.author.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <span className="text-sm text-foreground">{latestArticle.author.name}</span>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="relative aspect-[4/5] rounded-2xl border border-border bg-card p-10 shadow-2xl">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-accent/30 via-transparent to-transparent"
                />
                <Feather aria-hidden className="size-8 text-accent" />
                <blockquote className="mt-8 font-display text-2xl leading-snug text-foreground sm:text-3xl italic">
                  «Η ανάγνωση ως τρόπος να κατοικείς στον κόσμο.»
                </blockquote>
                <p className="mt-4 text-sm text-muted-foreground font-mono">Modus Legendi</p>
                <div className="absolute bottom-10 left-10 right-10 border-t border-border pt-5">
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-accent font-bold">
                    Philosophy
                  </p>
                  <p className="mt-1 text-sm text-foreground">Τρόπος ανάγνωσης, τρόπος ζωής.</p>
                </div>
              </div>
            )}
          </TiltCard>
        </Reveal>
      </div>
    </section>
  );
}

function ManifestoSection({ locale, t }: { locale: string; t: any }) {
  return (
    <section className="relative border-b border-border bg-accent text-accent-foreground">
      <div className="mx-auto max-w-4xl px-5 py-24 text-center sm:px-8">
        <BookOpen aria-hidden className="mx-auto size-8 opacity-70" />
        <p className="mt-8 text-balance font-display text-3xl leading-relaxed sm:text-4xl">
          {t.home.manifestoText || "Ένα βιβλίο δεν διαβάζεται μόνο· διαβάζεται μαζί με άλλους, ξανά και ξανά, μέσα από τα μάτια όσων το αγάπησαν πριν από μας."}
        </p>
        <p className="mt-6 text-sm uppercase tracking-[0.2em] opacity-60 font-mono">
          Το μανιφέστο μας
        </p>
      </div>
    </section>
  );
}

function PillarsSection({ locale, t }: { locale: string; t: any }) {
  const pillars = [
    {
      icon: PenLine,
      title: "Δοκίμιο & Κριτική",
      text: "Κείμενα βάθους πάνω σε συγγραφείς και έργα, γραμμένα από μέλη της ομάδας μας.",
    },
    {
      icon: BookOpen,
      title: "Συναντήσεις ανάγνωσης",
      text: "Μαζευόμαστε τακτικά για να συζητήσουμε ένα βιβλίο, με αργό ρυθμό και προσοχή στη λεπτομέρεια.",
    },
    {
      icon: Feather,
      title: "Μεταφράσεις & Συνεντεύξεις",
      text: "Φέρνουμε κοντά μας φωνές από άλλες γλώσσες και ανθρώπους της λογοτεχνίας.",
    },
  ];

  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
      <div className="grid gap-6 sm:grid-cols-3">
        {pillars.map(({ icon: Icon, title, text }, i) => (
          <Reveal key={title} delay={i * 100}>
            <TiltCard>
              <div className="group h-full border border-border bg-card p-7 transition-all duration-300 hover:border-accent hover:shadow-xl">
                <Icon aria-hidden className="size-6 text-accent transition-transform duration-300 group-hover:scale-110" />
                <h3 className="mt-5 font-display text-xl text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function FeaturedTeamSection({ locale, t }: { locale: string; t: any }) {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
      <div className="grid gap-12 lg:grid-cols-[1fr_2fr] items-center">
        <div>
          <p className="rule-label text-accent font-bold">Η Ομάδα</p>
          <h2 className="mt-4 text-3xl sm:text-4xl font-display">{t.about.teamTitle || "Η Συντακτική Ομάδα"}</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Μια συλλογικότητα αναγνωστών, επιμελητών και μεταφραστών που πιστεύει στη φροντίδα του κειμένου.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {team.map((member, i) => (
            <Reveal key={member.name} delay={i * 100}>
              <TiltCard>
                <div className="group border border-border bg-card p-6 transition-all duration-300 hover:border-accent">
                  <div className="flex items-center gap-4">
                    <div className="flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold text-lg">
                      {member.initials}
                    </div>
                    <div>
                      <h4 className="font-display text-lg">{member.name}</h4>
                      <p className="text-xs text-accent font-mono uppercase tracking-wider">{member.role[locale]}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                    {member.bio[locale]}
                  </p>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTASection({ locale, t }: { locale: string; t: any }) {
  return (
    <section className="relative border-t border-border">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-50"
        style={{
          background: "radial-gradient(50% 60% at 50% 100%, hsl(var(--accent) / 0.15), transparent 70%)",
        }}
      />
      <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-24 text-center sm:px-8">
        <img src={modusLogo} alt="Modus Legendi" className="h-12 w-auto opacity-90" />
        <h2 className="mt-8 font-display text-3xl text-foreground sm:text-4xl">
          {t.home.joinClub || "Μπες στη λέσχη."}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Συνδέσου για να βλέπεις όλα τα κείμενα της ομάδας μας σε ένα ζωντανό
          feed, μόλις δημοσιεύονται.
        </p>
        <Link
          to="/login"
          className="mt-8 flex w-full max-w-sm items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 font-medium text-foreground transition-colors hover:bg-secondary"
        >
          Συνέχεια με Google
        </Link>
      </div>
    </section>
  );
}

/* =========================================================
   LOGGED IN VIEW — The "Real" Literary Hub
   ========================================================= */

function LoggedInView({ locale, t }: { locale: string; t: any }) {
  const { profile } = useAuth();
  const [articles, setArticles] = useState<ArticleWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  const canWrite = profile?.role === "editor" || profile?.role === "admin";

  useEffect(() => {
    void loadFeed();
  }, []);

  const loadFeed = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("articles")
      .select("*, author:profiles(id, username, name, avatar_url), column:columns(id, slug, name)")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(30);

    setArticles((data as unknown as ArticleWithRelations[]) ?? []);
    setLoading(false);
  };

  const [first, ...rest] = articles;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <header className="mb-12 flex flex-col gap-6 border-l-4 border-accent pl-6 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {t.home.welcome || "Καλώς ήρθες"}{profile?.name ? `, ${profile.name}` : ""}
            </p>
            <h1 className="mt-2 font-display text-4xl text-foreground sm:text-5xl">
              {t.home.latest || "Τα τελευταία κείμενα"}
            </h1>
          </div>

          {/* Prominent write CTA — only visible to editors/admins */}
          {canWrite && (
            <Link
              to="/editor/new"
              className="group inline-flex shrink-0 items-center gap-2.5 rounded-full bg-accent px-6 py-3.5 text-sm font-medium text-accent-foreground shadow-lg shadow-accent/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/30"
            >
              <SquarePen aria-hidden className="size-4 transition-transform duration-300 group-hover:rotate-6" />
              Γράψε νέο άρθρο
            </Link>
          )}
        </header>

        {loading ? (
          <FeedSkeleton />
        ) : articles.length === 0 ? (
          <div className="mt-14 text-center">
            <BookOpen className="mx-auto size-12 text-muted-foreground/40 mb-4" />
            <p className="text-sm text-muted-foreground">
              Δεν έχουν δημοσιευτεί κείμενα ακόμα — έλα ξανά σύντομα.
            </p>
            {canWrite && (
              <Link
                to="/editor/new"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-transform hover:-translate-y-0.5"
              >
                <SquarePen aria-hidden className="size-4" />
                Γράψε το πρώτο άρθρο
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-16">
            {/* Featured Article */}
            {first && (
              <Reveal>
                <TiltCard>
                  <FeaturedArticleCard article={first} />
                </TiltCard>
              </Reveal>
            )}

            {/* Editorial Sections / Columns */}
            <section className="border-y border-border py-12">
              <h2 className="text-2xl font-display mb-8 flex items-center gap-3">
                <span className="h-px w-8 bg-accent"></span>
                {t.home.sections || "Θεματικές Στήλες"}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {sectionOrder.map((section, index) => (
                  <Reveal key={section} delay={index * 50}>
                    <TiltCard>
                      <Link
                        to="/magazine"
                        search={{ section }}
                        className="block h-full border border-border bg-card p-5 transition-colors hover:border-accent"
                      >
                        <h3 className="text-lg font-medium">{(t.sections as Record<string, string>)[section]}</h3>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {(sectionBlurbs[section as any] as any)[locale]}
                        </p>
                      </Link>
                    </TiltCard>
                  </Reveal>
                ))}
              </div>
            </section>

            {/* Rest of the Feed */}
            {rest.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((article, i) => (
                  <Reveal key={article.id} delay={i * 60}>
                    <TiltCard>
                      <ArticleFeedCard article={article} />
                    </TiltCard>
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   COMPONENTS FOR LOGGED IN VIEW
   ========================================================= */

function FeaturedArticleCard({ article }: { article: ArticleWithRelations }) {
  return (
    <Link
      to="/article/$articleId"
      params={{ articleId: article.id }}
      className="group grid gap-6 overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-xl sm:grid-cols-2"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-secondary sm:aspect-auto">
        {article.cover_url ? (
          <img
            src={article.cover_url}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen aria-hidden className="size-10 text-muted-foreground/40" />
          </div>
        )}
      </div>
      <div className="flex flex-col justify-center p-7 sm:p-10">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent font-bold">
          {article.column.name}
        </p>
        <h2 className="mt-3 font-display text-3xl leading-tight text-foreground group-hover:text-accent sm:text-4xl">
          {article.title}
        </h2>
        {article.subtitle && (
          <p className="mt-3 text-sm text-muted-foreground">{article.subtitle}</p>
        )}
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground/90">
          {excerpt(article.content, 220)}
        </p>
        <AuthorRow article={article} className="mt-6" />
      </div>
    </Link>
  );
}

function ArticleFeedCard({ article }: { article: ArticleWithRelations }) {
  return (
    <Link
      to="/article/$articleId"
      params={{ articleId: article.id }}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="aspect-[16/10] overflow-hidden bg-secondary">
        {article.cover_url ? (
          <img
            src={article.cover_url}
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
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-accent font-bold">
          {article.column.name}
        </p>
        <h3 className="mt-2 font-display text-xl leading-snug text-foreground group-hover:text-accent">
          {article.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground/90">
          {excerpt(article.content, 110)}
        </p>
        <AuthorRow article={article} className="mt-auto pt-5" />
      </div>
    </Link>
  );
}

function AuthorRow({ article, className }: { article: ArticleWithRelations; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {article.author.avatar_url ? (
        <img
          src={article.author.avatar_url}
          alt={article.author.name}
          className="size-6 rounded-full object-cover border border-border"
        />
      ) : (
        <span className="flex size-6 items-center justify-center rounded-full bg-accent text-accent-foreground text-[0.6rem] font-semibold">
          {article.author.name.charAt(0).toUpperCase()}
        </span>
      )}
      <span className="text-xs text-muted-foreground">{article.author.name}</span>
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse overflow-hidden rounded-xl border border-border">
          <div className="aspect-[16/10] bg-secondary" />
          <div className="space-y-2 p-5">
            <div className="h-3 w-16 rounded bg-secondary" />
            <div className="h-5 w-4/5 rounded bg-secondary" />
            <div className="h-3 w-1/2 rounded bg-secondary" />
          </div>
        </div>
      ))}
    </div>
  );
}