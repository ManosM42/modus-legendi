import { useEffect, useState, type CSSProperties } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Feather } from "lucide-react";
import { supabase } from "@/supabase/client";
import { AdSlotDisplay } from "@/components/Adslotdisplay";
import type { ArticleWithRelations } from "@/lib/types";

export const Route = createFileRoute("/article/$articleId")({
  component: ArticlePage,
});

function toEmbedUrl(url: string): string | null {
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

/** Same genre colours as the book covers on /writings, keyed by column slug. */
const COVER_THEMES: Record<string, { bg: string; bg2: string }> = {
  dokimio: { bg: "oklch(0.37 0.06 152)", bg2: "oklch(0.25 0.05 152)" }, // essays — green
  kritiki: { bg: "oklch(0.5 0.07 60)", bg2: "oklch(0.35 0.06 55)" }, // reviews — brown
  metafrasi: { bg: "oklch(0.57 0.13 42)", bg2: "oklch(0.43 0.11 38)" }, // translations — terracotta
  sinentefxi: { bg: "oklch(0.38 0.01 100)", bg2: "oklch(0.25 0.008 100)" }, // interviews — charcoal
};

const AP_CSS = `
.ap-root { --gold: oklch(0.84 0.09 85); }

/* Cloth-bound title page */
.ap-hero {
  background:
    repeating-linear-gradient(0deg, rgba(255,255,255,.022) 0 1px, transparent 1px 3px),
    radial-gradient(110% 90% at 20% 0%, color-mix(in oklab, var(--cb) 78%, white), var(--cb) 45%, var(--cb2));
}

/* Arch window — echoes the arch of the logo */
.ap-arch {
  position: relative; overflow: hidden;
  border-radius: 999px 999px 4px 4px;
  box-shadow: 0 0 0 3px var(--cb), 0 0 0 4px color-mix(in oklab, var(--gold) 70%, transparent), 0 24px 40px -18px rgba(0,0,0,.5);
  background: linear-gradient(165deg, color-mix(in oklab, var(--cb) 65%, white), var(--cb2));
}
.ap-arch img { width: 100%; height: 100%; object-fit: cover; display: block; filter: sepia(.14) saturate(.94) contrast(1.03); }
.ap-arch::after {
  content: ""; position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(180deg, transparent 55%, rgba(0,0,0,.26)), radial-gradient(90% 70% at 50% 20%, transparent 55%, rgba(0,0,0,.22));
}

/* The page itself, with stacked page edges underneath */
.ap-sheet {
  position: relative;
  box-shadow:
    0 4px 0 -1px color-mix(in oklab, var(--card) 88%, black),
    0 8px 0 -2px color-mix(in oklab, var(--card) 76%, black),
    0 44px 70px -34px rgba(40,25,10,.55);
}
.ap-sheet::before {
  content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  background: linear-gradient(90deg, rgba(60,40,20,.07), transparent 7%, transparent 93%, rgba(60,40,20,.07));
}

.ap-body {
  hyphens: auto;
  text-wrap: pretty;
  font-feature-settings: "liga", "onum";
}
`;

function ArticlePage() {
  const { articleId } = Route.useParams();
  const [article, setArticle] = useState<ArticleWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    void loadArticle();
  }, [articleId]);

  // Thin reading-progress line at the top of the page
  useEffect(() => {
    let frame = 0;
    const update = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
        frame = 0;
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [article]);

  const loadArticle = async () => {
    setLoading(true);
    setNotFound(false);

    const { data, error } = await supabase
      .from("articles")
      .select("*, author:profiles(id, username, name, avatar_url), column:columns(id, slug, name)")
      .eq("id", articleId)
      .single();

    if (error || !data) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setArticle(data as unknown as ArticleWithRelations);
    setLoading(false);
  };

  if (loading) return <div className="min-h-screen bg-background" />;
  if (notFound || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <p className="text-sm text-muted-foreground">Το άρθρο δεν βρέθηκε.</p>
      </div>
    );
  }

  const embedUrl = article.video_url ? toEmbedUrl(article.video_url) : null;

  const theme = COVER_THEMES[article.column.slug] ?? COVER_THEMES.dokimio;
  const vars = { "--cb": theme.bg, "--cb2": theme.bg2 } as CSSProperties;

  const words = article.content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  const readingTime = `${minutes} ${minutes === 1 ? "λεπτό" : "λεπτά"} ανάγνωσης`;

  return (
    <article className="ap-root min-h-screen bg-background pb-24" style={vars}>
      <style>{AP_CSS}</style>

      {/* Reading progress */}
      <div
        aria-hidden
        className="fixed inset-x-0 top-0 z-50 h-[3px] origin-left bg-accent"
        style={{ transform: `scaleX(${progress})` }}
      />

      {/* ---------- Title page ---------- */}
      <header className="ap-hero relative px-4 pb-32 pt-14 sm:px-8 sm:pb-36 sm:pt-20">
        <div
          className={
            article.cover_url
              ? "mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-[1fr_auto] md:gap-16"
              : "mx-auto max-w-3xl"
          }
        >
          <div>
            <Link
              to="/column/$slug"
              params={{ slug: article.column.slug }}
              className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-[var(--gold)] transition-colors hover:text-white"
            >
              <ArrowLeft
                aria-hidden
                className="size-3.5 transition-transform duration-300 group-hover:-translate-x-1"
              />
              {article.column.name}
            </Link>

            <div className="mt-6 flex items-center gap-3">
              <span className="h-px w-12 bg-[var(--gold)] opacity-60" />
              <Feather aria-hidden className="size-3.5 text-[var(--gold)]" />
            </div>

            <h1 className="mt-6 text-balance font-display text-4xl font-semibold leading-[1.05] text-[oklch(0.97_0.02_88)] drop-shadow-[0_1px_0_rgba(0,0,0,0.25)] sm:text-5xl md:text-6xl">
              {article.title}
            </h1>
            {article.subtitle && (
              <p className="mt-4 font-display text-xl italic leading-snug text-[oklch(0.94_0.03_88/0.82)] sm:text-2xl">
                {article.subtitle}
              </p>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link
                to="/profile/$username"
                params={{ username: article.author.username }}
                className="inline-flex items-center gap-2.5 text-sm text-[oklch(0.96_0.02_88)] transition-colors hover:text-white"
              >
                {article.author.avatar_url ? (
                  <img
                    src={article.author.avatar_url}
                    alt={article.author.name}
                    className="size-9 rounded-full border border-white/30 object-cover"
                  />
                ) : (
                  <span className="flex size-9 items-center justify-center rounded-full bg-[var(--gold)] text-xs font-semibold text-[oklch(0.24_0.016_60)]">
                    {article.author.name.charAt(0).toUpperCase()}
                  </span>
                )}
                {article.author.name}
              </Link>
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-[oklch(0.94_0.03_88/0.7)]">
                {readingTime}
              </span>
            </div>
          </div>

          {article.cover_url && (
            <div className="ap-arch mx-auto aspect-[3/3.7] w-56 sm:w-64 md:w-72">
              <img src={article.cover_url} alt="" />
            </div>
          )}
        </div>
      </header>

      {/* ---------- The page ---------- */}
      <div className="px-4 sm:px-8">
        <div className="ap-sheet mx-auto -mt-20 max-w-3xl rounded-xl bg-card px-6 py-12 sm:-mt-24 sm:px-16 sm:py-16">
          {embedUrl && (
            <figure className="relative z-[1] mb-12 aspect-video w-full overflow-hidden rounded-md bg-black ring-1 ring-border">
              <iframe
                src={embedUrl}
                title={article.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </figure>
          )}

          {/* Rendered as plain text here — swap for your markdown/rich-text
              renderer of choice (e.g. react-markdown) once content format
              is finalized. No comments section anywhere below — per brief. */}
          <div className="ap-body relative z-[1] whitespace-pre-wrap font-display text-[1.28rem] leading-[1.85] text-foreground/90 first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-display first-letter:text-[4.6rem] first-letter:font-semibold first-letter:leading-[0.78] first-letter:text-primary sm:text-[1.36rem]">
            {article.content.trimStart()}
          </div>

          {/* End-of-text ornament */}
          <div
            aria-hidden
            className="relative z-[1] mt-14 flex items-center justify-center gap-4 text-accent"
          >
            <span className="h-px w-16 bg-current opacity-40" />
            <Feather className="size-4" />
            <span className="h-px w-16 bg-current opacity-40" />
          </div>

          <div className="relative z-[1] mt-10 text-center">
            <Link
              to="/writings"
              className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-accent"
            >
              <ArrowLeft
                aria-hidden
                className="size-3.5 transition-transform duration-300 group-hover:-translate-x-1"
              />
              {article.column.name}
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-3xl">
          <AdSlotDisplay placement="footer" />
        </div>
      </div>
    </article>
  );
}