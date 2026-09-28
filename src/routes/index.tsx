import { useState, useEffect, type CSSProperties } from "react";
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
import heroImage from "@/assets/hero.png";
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

/* ---------------------------------------------------------
   Styles for the "library" buttons (wood + glass).
   Kept as style objects so the gradients stay readable.
   --------------------------------------------------------- */

// Warm wooden button: vertical grain lines over a brown gradient,
// with a light top edge and a dark bottom edge, like a shelf plank.
const woodButtonStyle: CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(92deg, rgba(255,255,255,0.055) 0px, rgba(255,255,255,0.055) 1px, transparent 1px, transparent 7px)," +
    "linear-gradient(180deg, oklch(0.56 0.075 62) 0%, oklch(0.44 0.07 56) 55%, oklch(0.37 0.06 52) 100%)",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -2px 0 rgba(0,0,0,0.28), 0 10px 24px -8px rgba(40,20,8,0.6)",
};

// Translucent "glass" button so the photo stays visible behind it.
const glassButtonStyle: CSSProperties = {
  backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.26), rgba(255,255,255,0.08))",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -1px 0 rgba(255,255,255,0.08), 0 10px 24px -10px rgba(0,0,0,0.5)",
};

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
    // nullsFirst: false + a created_at tiebreaker make this robust even
    // if published_at is ever null for some row — the true newest article
    // (by actual publish time, falling back to creation time) always wins.
    // See sql/006_fix_published_at.sql for the underlying DB-level fix.
    const { data } = await supabase
      .from("articles")
      .select("*, author:profiles(id, username, name, avatar_url), column:columns(id, slug, name)")
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
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
  const [parallaxY, setParallaxY] = useState(0);

  useEffect(() => {
    let frame = 0;

    const handleScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        // Keep the movement subtle so the text/card remain stable and mobile stays smooth.
        setParallaxY(Math.min(window.scrollY * 0.12, 90));
        frame = 0;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className="relative isolate min-h-[760px] overflow-hidden paper-grain sm:min-h-[820px]">
      {/* Landing-page-only hero background. The signed-in view is rendered by LoggedInView and never reaches this section. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <img
          src={heroImage}
          alt=""
          className="absolute inset-0 h-[115%] w-full max-w-none object-cover object-[58%_center] will-change-transform sm:h-[112%] sm:object-[60%_center]"
          style={{
            transform: `translate3d(0, ${parallaxY}px, 0)`,
            // Brighter, warmer photo (it was too dark).
            filter: "brightness(1.22) saturate(1.05) contrast(0.96)",
          }}
          onLoad={(event) => {
            event.currentTarget.style.willChange = window.matchMedia("(prefers-reduced-motion: reduce)").matches
              ? "auto"
              : "transform";
          }}
        />

        {/* Soft warm shade on the left only, so the text panel stays readable while the rest of the photo stays bright */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, oklch(0.22 0.03 60 / 0.35) 0%, oklch(0.22 0.03 60 / 0.12) 45%, transparent 75%)",
          }}
        />
      </div>

      {/* Smooth blend from the photo into the next (terracotta) section */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-40 bg-gradient-to-b from-transparent to-accent sm:h-56"
      />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-12 px-5 py-16 sm:gap-14 sm:px-8 sm:py-24 lg:min-h-[820px] lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-28">
        <Reveal>
          {/* Frosted panel: the photo stays visible through it */}
          <div
            className="rounded-3xl border border-white/25 p-7 shadow-2xl backdrop-blur-md sm:p-10"
            style={{ background: "oklch(0.22 0.03 60 / 0.3)" }}
          >
            <img
              src={modusLogo}
              alt="Modus Legendi"
              className="h-12 w-auto rounded-md shadow-lg ring-1 ring-white/30 sm:h-14"
            />
            <p className="mt-8 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[oklch(0.93_0.05_85)]">
              {t.home.heroKicker}
            </p>
            <h1 className="mt-4 max-w-3xl text-balance font-display text-5xl leading-[1.05] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)] sm:text-6xl md:text-7xl">
              {t.home.heroTitle}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
              {t.home.heroText}
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {/* Wooden button */}
              <Link
                to="/login"
                style={woodButtonStyle}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[oklch(0.3_0.05_50)] px-6 py-3.5 text-sm font-medium tracking-wide text-[oklch(0.97_0.02_88)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 sm:w-auto"
              >
                {t.actions.signIn || "Συνδέσου στη Λέσχη"}
                <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              {/* Glass button */}
              <Link
                to="/contact"
                style={glassButtonStyle}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/50 px-6 py-3.5 text-sm font-medium tracking-wide text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/80 hover:bg-white/10 sm:w-auto"
              >
                {t.nav.contact || "Επικοινωνία"}
              </Link>
            </div>
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
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent" />
                  </div>
                ) : (
                  <div className="flex h-2/5 w-full items-center justify-center bg-secondary">
                    <BookOpen aria-hidden className="size-10 text-muted-foreground/40" />
                  </div>
                )}

                <div className="flex flex-1 flex-col p-8 sm:p-10">
                  <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-accent">
                    Τελευταίο κείμενο · {latestArticle.column.name}
                  </p>
                  <h2 className="mt-3 font-display text-2xl leading-snug text-primary group-hover:text-accent sm:text-3xl">
                    {latestArticle.title}
                  </h2>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
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
                    <span className="text-sm font-medium text-foreground">{latestArticle.author.name}</span>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="relative aspect-[4/5] rounded-2xl border border-white/30 bg-card/90 p-10 text-foreground shadow-2xl backdrop-blur-md">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-accent/25 via-transparent to-transparent"
                />
                <Feather aria-hidden className="size-8 text-accent" />
                <blockquote className="mt-8 font-display text-2xl italic leading-snug text-primary sm:text-3xl">
                  «Η ανάγνωση ως τρόπος να κατοικείς στον κόσμο.»
                </blockquote>
                <p className="mt-4 font-mono text-sm text-muted-foreground">Modus Legendi</p>
                <div className="absolute bottom-10 left-10 right-10 border-t border-border pt-5">
                  <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-accent">
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
    <section className="relative overflow-hidden bg-accent text-accent-foreground">
      {/* Soft light from the top, like a lamp over a page */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 90% at 50% 0%, oklch(1 0 0 / 0.14), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-4xl px-5 pb-40 pt-20 text-center sm:px-8 sm:pt-24">
        <BookOpen aria-hidden className="mx-auto size-8 opacity-70" />
        <p className="mt-8 text-balance font-display text-3xl leading-relaxed sm:text-4xl">
          {t.home.manifestoText || "Ένα βιβλίο δεν διαβάζεται μόνο· διαβάζεται μαζί με άλλους, ξανά και ξανά, μέσα από τα μάτια όσων το αγάπησαν πριν από μας."}
        </p>
        <p className="mt-6 font-mono text-sm uppercase tracking-[0.2em] opacity-60">
          Το μανιφέστο μας
        </p>
      </div>

      {/* Smooth blend into the cream page below */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-b from-transparent to-background"
      />
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
    <section className="mx-auto w-full max-w-6xl px-5 pb-20 pt-6 sm:px-8 sm:pb-28">
      <div className="grid gap-6 sm:grid-cols-3">
        {pillars.map(({ icon: Icon, title, text }, i) => (
          <Reveal key={title} delay={i * 100}>
            <TiltCard>
              <div className="group h-full rounded-2xl border border-border bg-card p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="flex size-11 items-center justify-center rounded-full bg-secondary text-accent transition-transform duration-300 group-hover:scale-110">
                    <Icon aria-hidden className="size-5" />
                  </span>
                  <span className="font-mono text-xs tracking-[0.2em] text-brown">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-2xl text-primary">{title}</h3>
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
    // Full-width beige band that fades in and out, so the section has no hard edges
    <div className="bg-gradient-to-b from-background via-secondary/70 to-background">
      <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_2fr]">
          <div>
            <p className="rule-label font-bold text-accent">Η Ομάδα</p>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl">{t.about.teamTitle || "Η Συντακτική Ομάδα"}</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Μια συλλογικότητα αναγνωστών, επιμελητών και μεταφραστών που πιστεύει στη φροντίδα του κειμένου.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {team.map((member, i) => (
              <Reveal key={member.name} delay={i * 100}>
                <TiltCard>
                  <div className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex size-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                        {member.initials}
                      </div>
                      <div>
                        <h4 className="font-display text-lg">{member.name}</h4>
                        <p className="font-mono text-xs uppercase tracking-wider text-brown">{member.role[locale]}</p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      {member.bio[locale]}
                    </p>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function FinalCTASection({ locale, t }: { locale: string; t: any }) {
  return (
    <section className="relative isolate">
      {/* Warm glow rising from the bottom (fixed: the old hsl(var(--accent)) never rendered because the theme uses oklch) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(55% 65% at 50% 100%, color-mix(in oklab, var(--accent) 22%, transparent), transparent 72%)",
        }}
      />
      <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-24 text-center sm:px-8">
        <img src={modusLogo} alt="Modus Legendi" className="h-12 w-auto opacity-90" />
        <h2 className="mt-8 font-display text-3xl text-primary sm:text-4xl">
          {t.home.joinClub || "Μπες στη λέσχη."}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Συνδέσου στην λέσχη για να ανημερώνεσαι για νέες αλλαγές, να διαβάζεις τα κείμενα και να συμμετέχεις παραγωγή κειμένων. 
        </p>
        <Link
          to="/login"
          className="mt-8 flex w-full max-w-sm items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 font-medium text-foreground shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-secondary hover:shadow-md"
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
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(30);

    setArticles((data as unknown as ArticleWithRelations[]) ?? []);
    setLoading(false);
  };

  const [first, ...rest] = articles;

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/70 via-background to-background">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <header className="mb-12 flex flex-col gap-6 border-l-4 border-accent pl-6 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {t.home.welcome || "Καλώς ήρθες"}{profile?.name ? `, ${profile.name}` : ""}
            </p>
            <h1 className="mt-2 font-display text-4xl text-primary sm:text-5xl">
              {t.home.latest || "Τα τελευταία κείμενα"}
            </h1>
          </div>

          {/* Prominent write CTA — only visible to editors/admins */}
          {canWrite && (
            <Link
              to="/editor/new"
              style={woodButtonStyle}
              className="group inline-flex shrink-0 items-center gap-2.5 rounded-full border border-[oklch(0.3_0.05_50)] px-6 py-3.5 text-sm font-medium text-[oklch(0.97_0.02_88)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110"
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
                style={woodButtonStyle}
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-[oklch(0.3_0.05_50)] px-6 py-3 text-sm font-medium text-[oklch(0.97_0.02_88)] transition-all hover:-translate-y-0.5 hover:brightness-110"
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
              <h2 className="mb-8 flex items-center gap-3 font-display text-2xl text-primary">
                <span className="h-px w-8 bg-accent"></span>
                {t.home.sections || "Θεματικές Στήλες"}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {sectionOrder.map((section, index) => (
                  <Reveal key={section} delay={index * 50}>
                    <TiltCard>
                      <Link
                        to="/writings"
                        search={{ section }}
                        className="block h-full rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-lg"
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
      className="group grid gap-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-xl sm:grid-cols-2"
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
        <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-accent">
          {article.column.name}
        </p>
        <h2 className="mt-3 font-display text-3xl leading-tight text-primary group-hover:text-accent sm:text-4xl">
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
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
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
        <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.16em] text-accent">
          {article.column.name}
        </p>
        <h3 className="mt-2 font-display text-xl leading-snug text-primary group-hover:text-accent">
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
        <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-border">
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