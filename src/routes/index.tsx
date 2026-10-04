import {
  useState,
  useEffect,
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Feather, PenLine, SquarePen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n";
import { supabase } from "@/supabase/client";
import { cn } from "@/lib/utils";
import { sectionBlurbs, sectionOrder, team } from "@/data/content";
import { Reveal } from "@/components/site/Reveal";
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
   "Library" buttons: warm wood + frosted glass
   --------------------------------------------------------- */

const woodButtonStyle: CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(92deg, rgba(255,255,255,0.055) 0px, rgba(255,255,255,0.055) 1px, transparent 1px, transparent 7px)," +
    "linear-gradient(180deg, oklch(0.56 0.075 62) 0%, oklch(0.44 0.07 56) 55%, oklch(0.37 0.06 52) 100%)",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -2px 0 rgba(0,0,0,0.28), 0 10px 24px -8px rgba(40,20,8,0.6)",
};

const glassButtonStyle: CSSProperties = {
  backgroundColor: "oklch(0.22 0.03 60 / 0.38)",
  backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0.05))",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(255,255,255,0.08), 0 10px 24px -10px rgba(0,0,0,0.5)",
};

/* ---------------------------------------------------------
   3D hero book (terracotta cover, logo inlay)
   Prefix: bk-
   --------------------------------------------------------- */

const BK_CSS = `
.bk-link { display: flex; flex-direction: column; align-items: center; width: 100%; outline: none; }
.bk-link:focus-visible .bk-scene { outline: 2px solid var(--color-ring); outline-offset: 12px; border-radius: 12px; }

.bk-scene {
  --gold: oklch(0.86 0.09 85);
  --cb: oklch(0.6 0.135 42);
  --cb2: oklch(0.42 0.11 37);
  position: relative;
  width: min(64vw, 280px);
  perspective: 1300px;
  perspective-origin: 50% 40%;
  -webkit-tap-highlight-color: transparent;
}
@media (min-width: 1024px) { .bk-scene { width: min(100%, 310px); } }

.bk-shadow {
  position: absolute; left: 6%; right: -8%; bottom: -26px; height: 34px;
  background: radial-gradient(closest-side, rgba(20,8,2,.65), transparent);
  filter: blur(5px);
  animation: bk-shadow 7s ease-in-out infinite;
}

.bk-tilt {
  transform-style: preserve-3d;
  transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
  transition: transform .5s cubic-bezier(.2,.8,.2,1);
}
.bk-book {
  --t: 28px;
  position: relative; width: 100%; aspect-ratio: 2 / 3;
  transform-style: preserve-3d;
  transform: rotateX(-3deg) rotateY(22deg);
  animation: bk-float 7s ease-in-out infinite;
}
@keyframes bk-float {
  0%, 100% { transform: rotateX(-3deg) rotateY(20deg) translateY(0); }
  50%      { transform: rotateX(-1deg) rotateY(27deg) translateY(-12px); }
}
@keyframes bk-shadow {
  0%, 100% { transform: scale(1);   opacity: .9; }
  50%      { transform: scale(.88); opacity: .6; }
}
@keyframes bk-sheen {
  0%, 62% { background-position: 0 0; }
  100%    { background-position: 100% 0; }
}

.bk-face { position: absolute; backface-visibility: hidden; -webkit-backface-visibility: hidden; }

.bk-back { inset: 0; transform: translateZ(calc(var(--t) / -2)) rotateY(180deg); background: var(--cb2); border-radius: 8px 2px 2px 8px; }
.bk-spine {
  top: 0; bottom: 0; left: calc(var(--t) / -2); width: var(--t);
  transform: rotateY(-90deg);
  background:
    linear-gradient(var(--gold), var(--gold)) 0 10% / 100% 2px no-repeat,
    linear-gradient(var(--gold), var(--gold)) 0 13% / 100% 1px no-repeat,
    linear-gradient(var(--gold), var(--gold)) 0 87% / 100% 1px no-repeat,
    linear-gradient(var(--gold), var(--gold)) 0 90% / 100% 2px no-repeat,
    linear-gradient(90deg, var(--cb2), var(--cb) 45%, var(--cb2));
  border-radius: 2px 0 0 2px;
}
.bk-pages {
  top: 5px; bottom: 5px; right: calc(var(--t) / -2 + 3px); width: var(--t);
  transform: rotateY(90deg);
  background:
    linear-gradient(90deg, rgba(0,0,0,.2), transparent 45%),
    repeating-linear-gradient(90deg, #f7f0de 0 1.5px, #ddd3b8 1.5px 2.5px);
}
.bk-top, .bk-bottom {
  left: 3px; right: 6px; height: var(--t);
  background:
    linear-gradient(0deg, rgba(0,0,0,.16), transparent 50%),
    repeating-linear-gradient(0deg, #f7f0de 0 1.5px, #ddd3b8 1.5px 2.5px);
}
.bk-top { top: calc(var(--t) / -2 + 5px); transform: rotateX(90deg); }
.bk-bottom { bottom: calc(var(--t) / -2 + 5px); transform: rotateX(-90deg); }

.bk-front {
  inset: 0;
  transform: translateZ(calc(var(--t) / 2));
  border-radius: 2px 9px 9px 2px;
  overflow: hidden;
  container-type: inline-size;
  background:
    repeating-linear-gradient(0deg, rgba(255,255,255,.025) 0 1px, transparent 1px 3px),
    radial-gradient(120% 80% at 28% 0%, color-mix(in oklab, var(--cb) 80%, white), var(--cb) 48%, var(--cb2));
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.1), inset -2px 0 8px rgba(0,0,0,.28);
}
.bk-front::before { /* hinge groove */
  content: ""; position: absolute; top: 0; bottom: 0; left: 0; width: 8%; z-index: 2; pointer-events: none;
  background: linear-gradient(90deg, rgba(0,0,0,.4), rgba(0,0,0,.06) 55%, rgba(255,255,255,.18) 78%, rgba(0,0,0,.22) 92%, transparent);
}
.bk-front::after { /* sheen: sweeps across on its own + on hover */
  content: ""; position: absolute; inset: 0; z-index: 3; pointer-events: none;
  background: linear-gradient(115deg, transparent 0%, rgba(255,255,255,.3) 22%, rgba(255,255,255,.06) 34%, transparent 48%, rgba(0,0,0,.14) 100%);
  background-size: 260% 100%; background-position: 0 0;
  animation: bk-sheen 7s ease-in-out infinite;
}

.bk-frame {
  position: absolute; inset: 4.5cqw 4.5cqw 4.5cqw 12cqw; pointer-events: none;
  border: 1px solid color-mix(in oklab, var(--gold) 50%, transparent);
  border-radius: 2px;
}
.bk-cover {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; justify-content: space-between; gap: 3cqw;
  padding: 9.5cqw 8.5cqw 8.5cqw 16cqw;
}
.bk-kicker {
  display: flex; align-items: center; gap: 2.5cqw;
  font-family: var(--font-mono); font-size: max(8px, 3.2cqw);
  letter-spacing: .18em; text-transform: uppercase; white-space: nowrap;
  color: color-mix(in oklab, var(--gold) 90%, white);
}
.bk-kicker span { overflow: hidden; text-overflow: ellipsis; }
.bk-kicker i { flex: 1; min-width: 5cqw; height: 1px; background: color-mix(in oklab, var(--gold) 55%, transparent); }

/* the logo, inlaid like a paper label */
.bk-plate {
  width: 100%; aspect-ratio: 485 / 450; border-radius: 3px;
  background-color: #f9f6f1;
  background-repeat: no-repeat;
  background-size: 258.6% auto;
  background-position: 50.07% 37.9%;
  box-shadow:
    0 0 0 2px var(--cb),
    0 0 0 3px color-mix(in oklab, var(--gold) 75%, transparent),
    inset 0 0 14px rgba(120,90,50,.12),
    0 8px 16px -6px rgba(0,0,0,.5);
}

.bk-name { display: flex; flex-direction: column; align-items: center; gap: 2.2cqw; text-align: center; }
.bk-name span {
  font-family: var(--font-display); font-weight: 600; line-height: 1;
  font-size: 11cqw; letter-spacing: .12em; padding-left: .12em;
  color: oklch(0.98 0.02 88);
  text-shadow: 0 1px 0 rgba(0,0,0,.3), 0 0 14px rgba(0,0,0,.12);
}
.bk-name b { display: block; width: 20cqw; height: 1px; background: color-mix(in oklab, var(--gold) 85%, transparent); }

.bk-meta {
  margin: 0; padding-top: 2.5cqw; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  border-top: 1px solid color-mix(in oklab, var(--gold) 42%, transparent);
  font-family: var(--font-mono); font-size: max(8px, 2.9cqw);
  letter-spacing: .16em; text-transform: uppercase;
  color: oklch(0.95 0.03 88 / .88);
}

@media (prefers-reduced-motion: reduce) {
  .bk-book, .bk-shadow, .bk-front::after { animation: none; }
}
`;

function HeroBook({ t }: { t: any }) {
  const tiltRef = useRef<HTMLDivElement>(null);
  const words = String(t.brand ?? "MODUS LEGENDI").split(" ");
  const metadata: string[] = t.editorial?.metadata ?? [];

  // Desktop only: the book gently follows the cursor. Touch devices just get the idle float.
  const handleMove = (event: ReactPointerEvent) => {
    if (event.pointerType !== "mouse" || !tiltRef.current) return;
    const rect = tiltRef.current.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width - 0.5));
    const y = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height - 0.5));
    tiltRef.current.style.setProperty("--ry", `${(x * 18).toFixed(2)}deg`);
    tiltRef.current.style.setProperty("--rx", `${(-y * 12).toFixed(2)}deg`);
  };
  const handleLeave = () => {
    tiltRef.current?.style.setProperty("--ry", "0deg");
    tiltRef.current?.style.setProperty("--rx", "0deg");
  };

  return (
    <Link
      to="/writings"
      aria-label={t.landing.bookAria}
      className="bk-link group"
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      <style>{BK_CSS}</style>

      <div className="bk-scene">
        <span aria-hidden className="bk-shadow" />
        <div ref={tiltRef} className="bk-tilt">
          <div aria-hidden className="bk-book">
            <div className="bk-face bk-back" />
            <div className="bk-face bk-spine" />
            <div className="bk-face bk-pages" />
            <div className="bk-face bk-top" />
            <div className="bk-face bk-bottom" />

            <div className="bk-face bk-front">
              <div className="bk-frame" />
              <div className="bk-cover">
                <div className="bk-kicker">
                  <span>{t.nav.readingGroup}</span>
                  <i />
                </div>

                <div className="bk-plate" style={{ backgroundImage: `url(${modusLogo})` }} />

                <div className="bk-name">
                  <span>{words[0]}</span>
                  <b />
                  <span>{words.slice(1).join(" ")}</span>
                </div>

                <p className="bk-meta">{metadata.join(" · ")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Caption under the book */}
      <span
        style={glassButtonStyle}
        className="mt-12 inline-flex max-w-full items-center justify-center gap-2.5 rounded-full border border-white/40 px-6 py-3 text-center text-sm font-medium tracking-wide text-white backdrop-blur-md transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-white/70 group-hover:bg-white/10"
      >
        {t.landing.bookCta}
        <ArrowRight aria-hidden className="size-4 shrink-0 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

/* =========================================================
   PAGE
   ========================================================= */

function HomePage() {
  const { session, loading } = useAuth();
  const { locale, t } = useI18n();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
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
   LOGGED OUT VIEW — landing page
   ========================================================= */

function LoggedOutView({ locale, t }: { locale: string; t: any }) {
  const [latestArticle, setLatestArticle] = useState<ArticleWithRelations | null>(null);
  const [latestLoading, setLatestLoading] = useState(true);

  useEffect(() => {
    void loadLatest();
  }, []);

  const loadLatest = async () => {
    setLatestLoading(true);
    // nullsFirst: false + a created_at tiebreaker keep this robust even if
    // published_at is ever null for some row (see sql/006_fix_published_at.sql).
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
      <HeroSection t={t} />
      <ManifestoSection t={t} />
      <LatestSection t={t} article={latestArticle} loading={latestLoading} />
      <PillarsSection t={t} />
      <TeamSection locale={locale} t={t} />
      <FinalCTASection t={t} />
    </div>
  );
}

function HeroSection({ t }: { t: any }) {
  const imgRef = useRef<HTMLImageElement>(null);

  // Subtle parallax, written straight to the DOM (no React re-render on every scroll frame).
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = Math.min(window.scrollY * 0.12, 90);
      if (imgRef.current) imgRef.current.style.transform = `translate3d(0, ${y}px, 0)`;
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className="relative isolate overflow-hidden">
      {/* Background photo. It is taller than the section, so the parallax never exposes an empty edge. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <img
          ref={imgRef}
          src={heroImage}
          alt=""
          className="absolute left-0 w-full max-w-none object-cover object-[58%_center] will-change-transform sm:object-[60%_center]"
          style={{
            top: "-100px",
            height: "calc(100% + 200px)",
            filter: "brightness(1.22) saturate(1.05) contrast(0.96)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, oklch(0.22 0.03 60 / 0.35) 0%, oklch(0.22 0.03 60 / 0.12) 45%, transparent 75%)",
          }}
        />
      </div>

      {/* Smooth blend into the terracotta manifesto */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-40 bg-gradient-to-b from-transparent to-accent sm:h-52"
      />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-16 px-5 pb-36 pt-14 sm:px-8 sm:pb-40 sm:pt-20 lg:min-h-[780px] lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:py-28">
        <Reveal>
          {/* Frosted panel: the photo stays visible through it */}
          <div
            className="rounded-3xl border border-white/25 p-6 shadow-2xl backdrop-blur-md sm:p-10"
            style={{ background: "oklch(0.22 0.03 60 / 0.3)" }}
          >
            {t.home.heroKicker ? (
              <p className="mb-4 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[oklch(0.93_0.05_85)]">
                {t.home.heroKicker}
              </p>
            ) : null}
            <h1 className="max-w-3xl text-balance font-display text-4xl leading-[1.08] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)] sm:text-6xl xl:text-7xl">
              {t.home.heroTitle}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
              {t.home.heroText}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row">
              <Link
                to="/login"
                style={woodButtonStyle}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[oklch(0.3_0.05_50)] px-6 py-3.5 text-sm font-medium tracking-wide text-[oklch(0.97_0.02_88)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 sm:w-auto"
              >
                {t.landing.signIn}
                <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/contact"
                style={glassButtonStyle}
                className="inline-flex w-full items-center justify-center rounded-lg border border-white/50 px-6 py-3.5 text-sm font-medium tracking-wide text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/80 sm:w-auto"
              >
                {t.nav.contact}
              </Link>
            </div>
          </div>
        </Reveal>

        <Reveal delay={150}>
          <div className="flex justify-center">
            <HeroBook t={t} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ManifestoSection({ t }: { t: any }) {
  return (
    <section className="relative overflow-hidden bg-accent text-accent-foreground">
      {/* Soft light from the top, like a lamp over a page */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(60% 90% at 50% 0%, oklch(1 0 0 / 0.14), transparent 70%)" }}
      />

      <div className="relative mx-auto max-w-4xl px-5 pb-44 pt-16 text-center sm:px-8 sm:pt-24">
        <BookOpen aria-hidden className="mx-auto size-8 opacity-70" />
        <p className="mt-8 text-balance font-display text-2xl leading-relaxed sm:text-4xl">
          {t.home.manifestoText}
        </p>
        <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] opacity-65 sm:text-sm">
          {t.home.manifestoTitle}
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

/** Newest published piece. Overlaps the manifesto's fade so the two sections feel connected. */
function LatestSection({
  t,
  article,
  loading,
}: {
  t: any;
  article: ArticleWithRelations | null;
  loading: boolean;
}) {
  if (!loading && !article) return null;

  return (
    <section className="relative z-10 mx-auto -mt-28 w-full max-w-6xl px-5 sm:-mt-32 sm:px-8">
      {loading || !article ? (
        <div className="aspect-[16/10] animate-pulse rounded-2xl border border-border bg-card sm:aspect-[16/6]" />
      ) : (
        <Reveal>
          <FeaturedArticleCard
            article={article}
            kicker={`${t.landing.latestLabel}${article.column?.name ? ` · ${article.column.name}` : ""}`}
          />
        </Reveal>
      )}
    </section>
  );
}

function PillarsSection({ t }: { t: any }) {
  const icons = [PenLine, BookOpen, Feather];
  const pillars: { title: string; text: string }[] = t.landing.pillars;

  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
      <div className="grid gap-5 sm:grid-cols-3 sm:gap-6">
        {pillars.map(({ title, text }, i) => {
          const Icon = icons[i] ?? Feather;
          return (
            <Reveal key={title} delay={i * 100}>
              <div className="group h-full rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-xl sm:p-7">
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
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function TeamSection({ locale, t }: { locale: string; t: any }) {
  return (
    // Full-width beige band that fades in and out, so the section has no hard edges
    <div className="bg-gradient-to-b from-background via-secondary/70 to-background">
      <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_2fr] lg:gap-12">
          <div>
            <p className="rule-label font-bold text-accent">{t.editorial.teamTitle}</p>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl">{t.about.teamTitle}</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">{t.editorial.teamIntro}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {team.map((member, i) => (
              <Reveal key={member.name} delay={i * 100}>
                <div className="h-full rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-lg sm:p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                      {member.initials}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display text-lg">{member.name}</h3>
                      <p className="font-mono text-xs uppercase tracking-wider text-brown">
                        {member.role[locale]}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{member.bio[locale]}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function FinalCTASection({ t }: { t: any }) {
  return (
    <section className="relative isolate">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(55% 65% at 50% 100%, color-mix(in oklab, var(--accent) 22%, transparent), transparent 72%)",
        }}
      />
      <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-20 text-center sm:px-8 sm:py-24">
        <img src={modusLogo} alt="Modus Legendi" className="h-12 w-auto rounded-md opacity-90" />
        <h2 className="mt-8 font-display text-3xl text-primary sm:text-4xl">{t.landing.ctaTitle}</h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">{t.landing.ctaText}</p>
        <Link
          to="/login"
          className="mt-8 flex w-full max-w-sm items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 font-medium text-foreground shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-secondary hover:shadow-md"
        >
          {t.landing.ctaButton}
        </Link>
      </div>
    </section>
  );
}

/* =========================================================
   LOGGED IN VIEW — the literary hub
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
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-20">
        <header className="mb-10 flex flex-col gap-5 border-l-4 border-accent pl-5 sm:mb-12 sm:flex-row sm:items-end sm:justify-between sm:gap-4 sm:pl-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {t.landing.welcome}
              {profile?.name ? `, ${profile.name}` : ""}
            </p>
            <h1 className="mt-2 font-display text-3xl text-primary sm:text-5xl">{t.home.latest}</h1>
          </div>

          {/* Write CTA — editors / admins only */}
          {canWrite && (
            <Link
              to="/editor/new"
              style={woodButtonStyle}
              className="group inline-flex w-fit shrink-0 items-center gap-2.5 rounded-full border border-[oklch(0.3_0.05_50)] px-6 py-3.5 text-sm font-medium text-[oklch(0.97_0.02_88)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110"
            >
              <SquarePen aria-hidden className="size-4 transition-transform duration-300 group-hover:rotate-6" />
              {t.landing.writeNew}
            </Link>
          )}
        </header>

        {loading ? (
          <FeedSkeleton />
        ) : articles.length === 0 ? (
          <div className="mt-14 text-center">
            <BookOpen aria-hidden className="mx-auto mb-4 size-12 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">{t.landing.emptyFeed}</p>
            {canWrite && (
              <Link
                to="/editor/new"
                style={woodButtonStyle}
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-[oklch(0.3_0.05_50)] px-6 py-3 text-sm font-medium text-[oklch(0.97_0.02_88)] transition-all hover:-translate-y-0.5 hover:brightness-110"
              >
                <SquarePen aria-hidden className="size-4" />
                {t.landing.writeFirst}
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-14 sm:space-y-16">
            {first && (
              <Reveal>
                <FeaturedArticleCard article={first} />
              </Reveal>
            )}

            {/* Columns */}
            <section className="border-y border-border py-10 sm:py-12">
              <h2 className="mb-8 flex items-center gap-3 font-display text-2xl text-primary">
                <span className="h-px w-8 bg-accent" />
                {t.home.sections}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {sectionOrder.map((section, index) => (
                  <Reveal key={section} delay={index * 50}>
                    <Link
                      to="/writings"
                      search={{ section }}
                      className="block h-full rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-lg"
                    >
                      <h3 className="text-lg font-medium">{(t.sections as Record<string, string>)[section]}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {(sectionBlurbs[section as any] as any)?.[locale]}
                      </p>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </section>

            {rest.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((article, i) => (
                  <Reveal key={article.id} delay={Math.min(i * 60, 360)}>
                    <ArticleFeedCard article={article} />
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
   SHARED ARTICLE CARDS
   ========================================================= */

function FeaturedArticleCard({
  article,
  kicker,
}: {
  article: ArticleWithRelations;
  /** Overrides the small label above the title (defaults to the column name). */
  kicker?: string;
}) {
  const photo = article.cover_url ?? article.secondary_photo_url ?? null;

  return (
    <Link
      to="/article/$articleId"
      params={{ articleId: article.id }}
      className="group grid overflow-hidden rounded-2xl border border-border bg-card shadow-lg transition-shadow hover:shadow-xl sm:grid-cols-2"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-secondary sm:aspect-auto sm:min-h-[300px]">
        {photo ? (
          <img
            src={photo}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen aria-hidden className="size-10 text-muted-foreground/40" />
          </div>
        )}
      </div>
      <div className="flex flex-col justify-center p-6 sm:p-10">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-accent">
          {kicker ?? article.column?.name}
        </p>
        <h2 className="mt-3 font-display text-2xl leading-tight text-primary group-hover:text-accent sm:text-4xl">
          {article.title}
        </h2>
        {article.subtitle && <p className="mt-3 text-sm text-muted-foreground">{article.subtitle}</p>}
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground/90">{excerpt(article.content, 220)}</p>
        <AuthorRow article={article} className="mt-6" />
      </div>
    </Link>
  );
}

function ArticleFeedCard({ article }: { article: ArticleWithRelations }) {
  const photo = article.cover_url ?? article.secondary_photo_url ?? null;

  return (
    <Link
      to="/article/$articleId"
      params={{ articleId: article.id }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
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
        <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.16em] text-accent">
          {article.column?.name}
        </p>
        <h3 className="mt-2 font-display text-xl leading-snug text-primary group-hover:text-accent">
          {article.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground/90">{excerpt(article.content, 110)}</p>
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
          className="size-6 rounded-full border border-border object-cover"
        />
      ) : (
        <span className="flex size-6 items-center justify-center rounded-full bg-primary text-[0.6rem] font-semibold text-primary-foreground">
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