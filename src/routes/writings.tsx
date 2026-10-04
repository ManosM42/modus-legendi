import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, BookOpen, Feather } from "lucide-react";
import { useI18n } from "@/i18n";
import { supabase } from "@/supabase/client";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/site/Reveal";
import type { ArticleWithRelations } from "@/lib/types";

type SectionKey = "essays" | "reviews" | "translations" | "interviews";

// URL / translation key -> real column slug in the `columns` table
const SECTION_TO_SLUG: Record<SectionKey, string> = {
  essays: "dokimio",
  reviews: "kritiki",
  translations: "metafrasi",
  interviews: "sinentefxi",
};

const SECTION_ORDER: SectionKey[] = ["essays", "reviews", "translations", "interviews"];

/**
 * One colour "binding" per genre, taken from the site palette:
 * green (essays), brown (reviews), terracotta (translations), charcoal (interviews).
 * bg / bg2  -> book cover gradient
 * chip / chipDark -> filter chip colour in light / dark mode
 */
type Theme = { bg: string; bg2: string; chip: string; chipDark: string };

const THEMES: Record<SectionKey, Theme> = {
  essays: {
    bg: "oklch(0.37 0.06 152)",
    bg2: "oklch(0.25 0.05 152)",
    chip: "oklch(0.34 0.058 152)",
    chipDark: "oklch(0.78 0.075 150)",
  },
  reviews: {
    bg: "oklch(0.5 0.07 60)",
    bg2: "oklch(0.35 0.06 55)",
    chip: "oklch(0.45 0.065 60)",
    chipDark: "oklch(0.74 0.07 65)",
  },
  translations: {
    bg: "oklch(0.57 0.13 42)",
    bg2: "oklch(0.43 0.11 38)",
    chip: "oklch(0.54 0.128 42)",
    chipDark: "oklch(0.7 0.12 45)",
  },
  interviews: {
    bg: "oklch(0.38 0.01 100)",
    bg2: "oklch(0.25 0.008 100)",
    chip: "oklch(0.36 0.01 100)",
    chipDark: "oklch(0.78 0.012 95)",
  },
};

function themeOf(article: ArticleWithRelations): Theme {
  const slug = article.column?.slug;
  const key = SECTION_ORDER.find((k) => SECTION_TO_SLUG[k] === slug) ?? "essays";
  return THEMES[key];
}

function coverVars(theme: Theme): CSSProperties {
  return { "--cb": theme.bg, "--cb2": theme.bg2 } as CSSProperties;
}

export const Route = createFileRoute("/writings")({
  validateSearch: (search: Record<string, unknown>) => ({
    section: typeof search["section"] === "string" ? (search["section"] as SectionKey) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Κείμενα — MODUS LEGENDI" },
      {
        name: "description",
        content:
          "Όλα τα δημοσιευμένα κείμενα του MODUS LEGENDI: δοκίμια, κριτικές, μεταφράσεις και συνεντεύξεις, σε ένα ενιαίο αρχείο.",
      },
      { property: "og:title", content: "Κείμενα — MODUS LEGENDI" },
      {
        property: "og:description",
        content: "Το πλήρες αρχείο κειμένων της λέσχης, χωρίς κατηγορίες.",
      },
    ],
  }),
  component: WritingsPage,
});

function excerpt(text: string, maxLength = 200): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  return clean.slice(0, maxLength).replace(/\s+\S*$/, "") + "…";
}

function formatDate(iso: string | null, locale: string): string {
  if (!iso) return "";
  const localeTag = locale === "el" ? "el-GR" : locale === "de" ? "de-DE" : "en-US";
  return new Date(iso).toLocaleDateString(localeTag, { day: "numeric", month: "long", year: "numeric" });
}

/* =========================================================
   STYLES — books, shelves, chips (prefix: wl-)
   ========================================================= */

const WL_CSS = `
.wl-root { --gold: oklch(0.84 0.09 85); }

/* ---------- Filter chips ---------- */
.wl-chip {
  --c: var(--c-light);
  display: flex; align-items: center; gap: 0.4rem;
  border-radius: 999px;
  border: 1px solid color-mix(in oklab, var(--c) 38%, transparent);
  color: var(--c);
  padding: 0.375rem 1rem;
  font-family: var(--font-mono);
  font-size: 0.75rem; letter-spacing: 0.12em; text-transform: uppercase;
  transition: background-color .25s, border-color .25s, transform .25s;
}
.dark .wl-chip { --c: var(--c-dark); }
.wl-chip:hover { background: color-mix(in oklab, var(--c) 10%, transparent); transform: translateY(-1px); }
.wl-chip[data-active="true"] {
  border-color: var(--c);
  background: color-mix(in oklab, var(--c) 16%, transparent);
}
.wl-dot { width: .375rem; height: .375rem; border-radius: 999px; background: var(--c); }

/* ---------- Wooden shelf plank ---------- */
.wl-plank {
  position: relative;
  height: 16px;
  margin: 0 -0.75rem;
  border-radius: 2px;
  background:
    repeating-linear-gradient(90deg, rgba(255,255,255,.045) 0 2px, transparent 2px 9px),
    linear-gradient(180deg, oklch(0.62 0.07 64) 0%, oklch(0.5 0.07 58) 38%, oklch(0.39 0.065 53) 100%);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.38),
    inset 0 -1px 0 rgba(0,0,0,.3),
    0 14px 18px -10px rgba(40,20,8,.55);
}
.wl-plank--wide { margin: 0; height: 12px; border-radius: 0; }

/* ---------- 3D book ---------- */
.wl-link { display: block; outline: none; }
.wl-link:focus-visible { outline: 2px solid var(--color-ring); outline-offset: 6px; border-radius: 12px; }

.wl-scene {
  position: relative; z-index: 1;
  margin: 0 12%;
  perspective: 1200px;
  perspective-origin: 50% 35%;
}
.wl-shadow {
  position: absolute; left: 4%; right: -6%; bottom: -8px; height: 22px;
  background: radial-gradient(closest-side, rgba(30,15,5,.6), transparent);
  filter: blur(3px);
  transition: transform .7s cubic-bezier(.2,.8,.2,1), opacity .7s;
}
.wl-link:hover .wl-shadow, .wl-link:focus-visible .wl-shadow { transform: scale(.88) translateY(5px); opacity: .55; }

.wl-book {
  --t: 24px;
  position: relative; width: 100%; aspect-ratio: 5 / 7;
  transform-style: preserve-3d;
  transform: rotateX(-3deg) rotateY(22deg);
  transition: transform .7s cubic-bezier(.2,.8,.2,1);
  will-change: transform;
}
.wl-link:hover .wl-book, .wl-link:focus-visible .wl-book {
  transform: rotateX(0deg) rotateY(7deg) translateY(-10px) scale(1.03);
}

.wl-face { position: absolute; backface-visibility: hidden; -webkit-backface-visibility: hidden; }

.wl-back { inset: 0; transform: translateZ(calc(var(--t) / -2)) rotateY(180deg); background: var(--cb2); border-radius: 8px 2px 2px 8px; }

.wl-spine {
  top: 0; bottom: 0; left: calc(var(--t) / -2); width: var(--t);
  transform: rotateY(-90deg);
  background:
    linear-gradient(var(--gold), var(--gold)) 0 11% / 100% 2px no-repeat,
    linear-gradient(var(--gold), var(--gold)) 0 14% / 100% 1px no-repeat,
    linear-gradient(var(--gold), var(--gold)) 0 86% / 100% 1px no-repeat,
    linear-gradient(var(--gold), var(--gold)) 0 89% / 100% 2px no-repeat,
    linear-gradient(90deg, var(--cb2), var(--cb) 45%, var(--cb2));
  border-radius: 2px 0 0 2px;
}
.wl-pages {
  top: 5px; bottom: 5px; right: calc(var(--t) / -2 + 3px); width: var(--t);
  transform: rotateY(90deg);
  background:
    linear-gradient(90deg, rgba(0,0,0,.2), transparent 45%),
    repeating-linear-gradient(90deg, #f7f0de 0 1.5px, #ddd3b8 1.5px 2.5px);
}
.wl-top, .wl-bottom {
  left: 3px; right: 6px; height: var(--t);
  background:
    linear-gradient(0deg, rgba(0,0,0,.16), transparent 50%),
    repeating-linear-gradient(0deg, #f7f0de 0 1.5px, #ddd3b8 1.5px 2.5px);
}
.wl-top { top: calc(var(--t) / -2 + 5px); transform: rotateX(90deg); }
.wl-bottom { bottom: calc(var(--t) / -2 + 5px); transform: rotateX(-90deg); }

.wl-front {
  inset: 0;
  transform: translateZ(calc(var(--t) / 2));
  border-radius: 2px 8px 8px 2px;
  overflow: hidden;
  container-type: inline-size;
  background:
    repeating-linear-gradient(0deg, rgba(255,255,255,.022) 0 1px, transparent 1px 3px),
    radial-gradient(120% 80% at 30% 0%, color-mix(in oklab, var(--cb) 78%, white), var(--cb) 45%, var(--cb2));
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.08), inset -2px 0 6px rgba(0,0,0,.25);
}
/* hinge groove near the spine */
.wl-front::before {
  content: ""; position: absolute; top: 0; bottom: 0; left: 0; width: 8%;
  background: linear-gradient(90deg, rgba(0,0,0,.4), rgba(0,0,0,.06) 55%, rgba(255,255,255,.16) 78%, rgba(0,0,0,.22) 92%, transparent);
  pointer-events: none; z-index: 2;
}
/* glossy sheen that slides across on hover */
.wl-front::after {
  content: ""; position: absolute; inset: 0; z-index: 3; pointer-events: none;
  background: linear-gradient(115deg, rgba(255,255,255,.26) 0%, rgba(255,255,255,.05) 28%, transparent 52%, rgba(0,0,0,.16) 100%);
  background-size: 220% 100%; background-position: 0 0;
  transition: background-position 1s cubic-bezier(.2,.8,.2,1);
}
.wl-link:hover .wl-front::after, .wl-link:focus-visible .wl-front::after { background-position: 100% 0; }

.wl-cover {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; gap: 4.5cqw;
  padding: 9cqw 8cqw 8cqw 15cqw;
}
.wl-kicker {
  display: flex; align-items: center; gap: 2.5cqw;
  font-family: var(--font-mono); font-size: max(9px, 3.7cqw);
  letter-spacing: .18em; text-transform: uppercase;
  color: color-mix(in oklab, var(--gold) 88%, white);
  white-space: nowrap;
}
.wl-kicker span { overflow: hidden; text-overflow: ellipsis; }
.wl-kicker i { flex: 1; min-width: 6cqw; height: 1px; background: color-mix(in oklab, var(--gold) 55%, transparent); }

/* arch window — echoes the arch of the logo */
.wl-arch {
  position: relative; overflow: hidden;
  border-radius: 999px 999px 3px 3px;
  box-shadow: 0 0 0 2.5px var(--cb), 0 0 0 3.5px color-mix(in oklab, var(--gold) 70%, transparent);
  background: linear-gradient(165deg, color-mix(in oklab, var(--cb) 65%, white), var(--cb2));
}
.wl-arch img { width: 100%; height: 100%; object-fit: cover; display: block; filter: sepia(.16) saturate(.92) contrast(1.03); }
.wl-arch::after {
  content: ""; position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(180deg, transparent 55%, rgba(0,0,0,.28)), radial-gradient(90% 70% at 50% 20%, transparent 55%, rgba(0,0,0,.25));
}
.wl-arch-empty { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;
  background: radial-gradient(60% 50% at 50% 40%, color-mix(in oklab, var(--gold) 22%, transparent), transparent 70%); }
.wl-cover .wl-arch { flex: 1 1 0; min-height: 0; width: 100%; }

.wl-title {
  font-family: var(--font-display); font-weight: 600;
  color: oklch(0.97 0.02 88);
  line-height: 1.08; text-wrap: balance;
  font-size: 8.4cqw;
  text-shadow: 0 1px 0 rgba(0,0,0,.28);
  display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 4; overflow: hidden;
}
.wl-title[data-len="s"] { font-size: 9.8cqw; }
.wl-title[data-len="l"] { font-size: 6.9cqw; }

.wl-author {
  border-top: 1px solid color-mix(in oklab, var(--gold) 42%, transparent);
  padding-top: 3cqw;
  font-family: var(--font-mono); font-size: max(9px, 3.5cqw);
  letter-spacing: .16em; text-transform: uppercase;
  color: oklch(0.94 0.03 88 / .88);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

/* ---------- Featured: open book ---------- */
.wl-open {
  position: relative;
  border-radius: 14px;
  box-shadow:
    0 4px 0 -1px color-mix(in oklab, var(--card) 88%, black),
    0 8px 0 -2px color-mix(in oklab, var(--card) 76%, black),
    0 34px 60px -26px rgba(40,25,10,.55);
  transition: transform .5s cubic-bezier(.2,.8,.2,1), box-shadow .5s;
}
.wl-link:hover .wl-open { transform: translateY(-6px); }
.wl-open-inner { overflow: hidden; border-radius: 14px; }
.wl-left-page {
  position: relative; overflow: hidden;
  background:
    repeating-linear-gradient(0deg, rgba(255,255,255,.022) 0 1px, transparent 1px 3px),
    radial-gradient(120% 80% at 30% 0%, color-mix(in oklab, var(--cb) 78%, white), var(--cb) 45%, var(--cb2));
}
.wl-left-page::after { /* gutter shadow on the left page */
  content: ""; position: absolute; top: 0; bottom: 0; right: 0; width: 14%; pointer-events: none;
  background: linear-gradient(270deg, rgba(0,0,0,.38), transparent);
}
.wl-right-page { position: relative; background: var(--card); }
.wl-right-page::before { /* gutter shadow on the right page */
  content: ""; position: absolute; top: 0; bottom: 0; left: 0; width: 9%; pointer-events: none;
  background: linear-gradient(90deg, rgba(60,40,20,.2), transparent);
}
@media (max-width: 639px) {
  .wl-left-page::after, .wl-right-page::before { display: none; }
}
`;

/* =========================================================
   PAGE
   ========================================================= */

function WritingsPage() {
  const { locale, t } = useI18n();
  const { section } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [articles, setArticles] = useState<ArticleWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadWritings();
  }, []);

  const loadWritings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("articles")
      .select("*, author:profiles(id, username, name, avatar_url), column:columns(id, slug, name)")
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    setArticles((data as unknown as ArticleWithRelations[]) ?? []);
    setLoading(false);
  };

  const filtered = useMemo(() => {
    if (!section) return articles;
    const dbSlug = SECTION_TO_SLUG[section as SectionKey];
    if (!dbSlug) return articles;
    return articles.filter((article) => article.column?.slug === dbSlug);
  }, [articles, section]);

  const [featured, ...rest] = filtered;

  return (
    <div className="wl-root relative overflow-hidden bg-background">
      <style>{WL_CSS}</style>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[460px] opacity-70"
        style={{
          background:
            "radial-gradient(55% 60% at 15% 0%, color-mix(in oklab, var(--accent) 16%, transparent), transparent 65%), radial-gradient(45% 50% at 95% 15%, color-mix(in oklab, var(--accent) 10%, transparent), transparent 60%)",
        }}
      />

      <header className="paper-grain bg-gradient-to-b from-secondary/50 to-background">
        <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <Reveal>
            <p className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent">
              <Feather aria-hidden className="size-3.5" />
              {t.writings.kicker}
            </p>
            <h1 className="mt-4 text-balance font-display text-5xl leading-[1.05] text-primary sm:text-6xl md:text-7xl">
              {section ? t.sections[section as SectionKey] : t.writings.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t.writings.intro}
            </p>
          </Reveal>

          {/* Section filter chips */}
          <Reveal delay={80}>
            <div className="mt-8 flex flex-wrap items-center gap-2">
              <Link
                to="/writings"
                search={{ section: undefined }}
                className={cn(
                  "rounded-full border px-4 py-1.5 font-mono text-xs uppercase tracking-[0.12em] transition-colors",
                  !section
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
                )}
              >
                {t.magazine.filterAll}
              </Link>
              {SECTION_ORDER.map((key) => {
                const theme = THEMES[key];
                const isActive = section === key;
                return (
                  <Link
                    key={key}
                    to="/writings"
                    search={{ section: key }}
                    className="wl-chip"
                    data-active={isActive}
                    style={{ "--c-light": theme.chip, "--c-dark": theme.chipDark } as CSSProperties}
                  >
                    <span aria-hidden className="wl-dot" />
                    {t.sections[key]}
                  </Link>
                );
              })}
            </div>
          </Reveal>

          {/* Decorative row of book spines standing on the shelf below */}
          <ShelfDecor />
        </div>
      </header>
      <div aria-hidden className="wl-plank wl-plank--wide" />

      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        {loading ? (
          <WritingsSkeleton />
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center">
            <BookOpen aria-hidden className="mx-auto mb-4 size-12 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">{t.writings.empty}</p>
            {section && (
              <button
                type="button"
                onClick={() => navigate({ search: { section: undefined } })}
                className="mt-4 text-xs font-mono uppercase tracking-[0.12em] text-accent underline-offset-4 hover:underline"
              >
                {t.actions.clear}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-20">
            {featured && (
              <Reveal>
                <FeaturedWriting article={featured} locale={locale} label={t.writings.featuredLabel} />
              </Reveal>
            )}

            {rest.length > 0 && (
              <div className="grid gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((article, i) => (
                  <Reveal key={article.id} delay={Math.min(i * 50, 400)}>
                    <WritingCard article={article} locale={locale} />
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
   DECOR
   ========================================================= */

const SPINES: { w: number; h: number; k: SectionKey; lean?: boolean }[] = [
  { w: 20, h: 104, k: "essays" },
  { w: 15, h: 86, k: "translations" },
  { w: 24, h: 124, k: "reviews" },
  { w: 17, h: 98, k: "interviews" },
  { w: 22, h: 116, k: "essays" },
  { w: 14, h: 82, k: "reviews" },
  { w: 26, h: 132, k: "translations" },
  { w: 18, h: 100, k: "essays", lean: true },
];

function ShelfDecor() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute bottom-0 right-8 hidden items-end gap-[3px] lg:flex"
    >
      {SPINES.map((s, i) => {
        const th = THEMES[s.k];
        return (
          <span
            key={i}
            className="relative block rounded-t-[2px]"
            style={{
              width: s.w,
              height: s.h,
              background: `linear-gradient(90deg, ${th.bg2}, ${th.bg} 45%, ${th.bg2})`,
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,.07), 2px 0 4px -1px rgba(0,0,0,.25)",
              transform: s.lean ? "rotate(7deg)" : undefined,
              transformOrigin: "bottom right",
              marginLeft: s.lean ? 6 : 0,
            }}
          >
            <span className="absolute inset-x-0 top-[12%] h-[2px] bg-[var(--gold)] opacity-70" />
            <span className="absolute inset-x-0 top-[18%] h-px bg-[var(--gold)] opacity-50" />
            <span className="absolute inset-x-0 bottom-[14%] h-px bg-[var(--gold)] opacity-50" />
          </span>
        );
      })}
    </div>
  );
}

/* =========================================================
   FEATURED — open book spread
   ========================================================= */

function FeaturedWriting({
  article,
  locale,
  label,
}: {
  article: ArticleWithRelations;
  locale: string;
  label: string;
}) {
  const photo = article.cover_url ?? article.secondary_photo_url ?? null;
  const theme = themeOf(article);

  return (
    <Link
      to="/article/$articleId"
      params={{ articleId: article.id }}
      className="wl-link group"
    >
      <div className="wl-open">
        <div className="wl-open-inner grid sm:grid-cols-2">
          {/* Left page: illustration inside an arch */}
          <div
            className="wl-left-page flex min-h-[340px] flex-col items-center justify-center gap-5 p-8 sm:p-12"
            style={coverVars(theme)}
          >
            <div className="wl-arch relative z-[1] aspect-[3/3.7] w-[62%] max-w-[300px]">
              {photo ? (
                <img
                  src={photo}
                  alt=""
                  className="transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="wl-arch-empty">
                  <BookOpen aria-hidden className="size-14 text-[var(--gold)] opacity-80" />
                </div>
              )}
            </div>
            <p className="relative z-[1] font-mono text-[0.7rem] uppercase tracking-[0.22em] text-[var(--gold)]">
              {article.column?.name ?? "—"}
            </p>
          </div>

          {/* Right page: text */}
          <div className="wl-right-page flex flex-col justify-center p-8 sm:p-12">
            <span className="relative z-[1] flex w-fit items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-accent">
              <span aria-hidden className="size-1.5 rounded-full bg-accent" />
              {label}
            </span>
            <p className="relative z-[1] mt-4 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
              {article.column?.name ?? "—"} · {formatDate(article.published_at, locale)}
            </p>
            <h2 className="relative z-[1] mt-3 font-display text-3xl leading-tight text-primary transition-colors group-hover:text-accent sm:text-4xl">
              {article.title}
            </h2>
            {article.subtitle && (
              <p className="relative z-[1] mt-2 font-display text-lg italic text-muted-foreground">
                {article.subtitle}
              </p>
            )}

            <div className="relative z-[1] mt-5 flex items-center gap-3">
              <span className="h-px w-10 bg-accent/60" />
              <Feather aria-hidden className="size-3.5 text-accent" />
            </div>

            <p className="relative z-[1] mt-5 font-display text-[1.15rem] leading-relaxed text-foreground/85 first-letter:float-left first-letter:pr-2 first-letter:font-display first-letter:text-6xl first-letter:font-semibold first-letter:leading-[0.8] first-letter:text-primary">
              {excerpt(article.content, 300)}
            </p>

            <div className="relative z-[1] mt-8 flex items-center justify-between border-t border-border pt-5">
              <div className="flex items-center gap-3">
                {article.author.avatar_url ? (
                  <img
                    src={article.author.avatar_url}
                    alt={article.author.name}
                    className="size-9 rounded-full border border-border object-cover"
                  />
                ) : (
                  <span className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {article.author.name.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="text-sm text-foreground">{article.author.name}</span>
              </div>
              <ArrowUpRight
                aria-hidden
                className="size-5 text-accent transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* =========================================================
   BOOK ON A SHELF
   ========================================================= */

function WritingCard({ article, locale }: { article: ArticleWithRelations; locale: string }) {
  const photo = article.cover_url ?? article.secondary_photo_url ?? null;
  const theme = themeOf(article);
  const len = article.title.length;
  const sizeKey = len < 26 ? "s" : len < 48 ? "m" : "l";

  return (
    <Link
      to="/article/$articleId"
      params={{ articleId: article.id }}
      className="wl-link group"
      title={article.title}
    >
      {/* The book, standing on a wooden shelf */}
      <div className="relative">
        <div className="wl-scene">
          <span aria-hidden className="wl-shadow" />
          <div className="wl-book" style={coverVars(theme)}>
            <div aria-hidden className="wl-face wl-back" />
            <div aria-hidden className="wl-face wl-spine" />
            <div aria-hidden className="wl-face wl-pages" />
            <div aria-hidden className="wl-face wl-top" />
            <div aria-hidden className="wl-face wl-bottom" />

            <div className="wl-face wl-front">
              <div className="wl-cover">
                <div className="wl-kicker">
                  <span>{article.column?.name ?? "—"}</span>
                  <i />
                </div>

                <div className="wl-arch">
                  {photo ? (
                    <img src={photo} alt="" />
                  ) : (
                    <div className="wl-arch-empty">
                      <Feather aria-hidden className="size-1/3 text-[var(--gold)] opacity-80" />
                    </div>
                  )}
                </div>

                <h3 className="wl-title" data-len={sizeKey}>
                  {article.title}
                </h3>

                <p className="wl-author">{article.author.name}</p>
              </div>
            </div>
          </div>
        </div>
        <div aria-hidden className="wl-plank" />
      </div>

      {/* Details under the shelf */}
      <div className="px-1 pt-6">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-accent">
          {article.column?.name ?? "—"} · {formatDate(article.published_at, locale)}
        </p>
        {article.subtitle && (
          <p className="mt-2 font-display text-lg leading-snug text-primary">{article.subtitle}</p>
        )}
        <p className="mt-2 line-clamp-4 font-display text-[1.05rem] italic leading-relaxed text-foreground/80">
          «{excerpt(article.content, 170)}»
        </p>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
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
          <ArrowUpRight
            aria-hidden
            className="size-4 text-accent transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </div>
      </div>
    </Link>
  );
}

/* =========================================================
   SKELETON
   ========================================================= */

function WritingsSkeleton() {
  return (
    <div className="space-y-20">
      <div className="grid animate-pulse overflow-hidden rounded-[14px] border border-border sm:grid-cols-2">
        <div className="min-h-[340px] bg-secondary" />
        <div className="space-y-3 p-10">
          <div className="h-3 w-24 rounded bg-secondary" />
          <div className="h-8 w-4/5 rounded bg-secondary" />
          <div className="h-3 w-full rounded bg-secondary" />
          <div className="h-3 w-2/3 rounded bg-secondary" />
        </div>
      </div>
      <div className="grid gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="mx-[12%] aspect-[5/7] rounded-[3px_8px_8px_3px] bg-secondary" />
            <div className="h-4 rounded-sm bg-secondary/80" />
            <div className="space-y-2 pt-6">
              <div className="h-3 w-24 rounded bg-secondary" />
              <div className="h-4 w-4/5 rounded bg-secondary" />
              <div className="h-3 w-1/2 rounded bg-secondary" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}