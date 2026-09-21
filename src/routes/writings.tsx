import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Feather } from "lucide-react";
import { useI18n } from "@/i18n";
import { supabase } from "@/supabase/client";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/site/Reveal";
import { TiltCard } from "@/components/site/TiltCard";
import type { ArticleWithRelations } from "@/lib/types";

export const Route = createFileRoute("/writings")({
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

function WritingsPage() {
  const { locale, t } = useI18n();
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

  const [featured, ...rest] = articles;

  return (
    <div className="relative overflow-hidden bg-background">
      {/* Ambient accent glow, consistent with the rest of the site */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[460px] opacity-60"
        style={{
          background:
            "radial-gradient(55% 60% at 15% 0%, hsl(var(--accent) / 0.16), transparent 65%), radial-gradient(45% 50% at 95% 15%, hsl(var(--accent) / 0.10), transparent 60%)",
        }}
      />

      {/* Header */}
      <header className="border-b border-border paper-grain">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <Reveal>
            <p className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent">
              <Feather aria-hidden className="size-3.5" />
              {t.writings.kicker}
            </p>
            <h1 className="mt-4 text-balance font-display text-5xl leading-[1.05] text-foreground sm:text-6xl md:text-7xl">
              {t.writings.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t.writings.intro}
            </p>
          </Reveal>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        {loading ? (
          <WritingsSkeleton />
        ) : articles.length === 0 ? (
          <div className="py-24 text-center">
            <BookOpen aria-hidden className="mx-auto mb-4 size-12 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">{t.writings.empty}</p>
          </div>
        ) : (
          <div className="space-y-14">
            {/* Featured — the newest piece, given more room */}
            {featured && (
              <Reveal>
                <TiltCard>
                  <FeaturedWriting article={featured} locale={locale} label={t.writings.featuredLabel} />
                </TiltCard>
              </Reveal>
            )}

            {/* Everything else — one continuous, uncategorised gallery */}
            {rest.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((article, i) => (
                  <Reveal key={article.id} delay={Math.min(i * 50, 400)}>
                    <TiltCard>
                      <WritingCard article={article} locale={locale} />
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

  return (
    <Link
      to="/article/$articleId"
      params={{ articleId: article.id }}
      className="group relative grid overflow-hidden rounded-3xl border border-border bg-card shadow-2xl transition-shadow duration-300 hover:shadow-accent/10 sm:grid-cols-2"
    >
      <div className="relative aspect-[16/11] overflow-hidden bg-secondary sm:aspect-auto">
        {photo ? (
          <img
            src={photo}
            alt=""
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen aria-hidden className="size-12 text-muted-foreground/40" />
          </div>
        )}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent sm:hidden"
        />
      </div>

      <div className="flex flex-col justify-center p-8 sm:p-12">
        <span className="w-fit rounded-full border border-accent/40 bg-accent/10 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-accent">
          {label}
        </span>
        <p className="mt-4 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
          {article.column.name} · {formatDate(article.published_at, locale)}
        </p>
        <h2 className="mt-3 font-display text-3xl leading-tight text-foreground transition-colors group-hover:text-accent sm:text-4xl">
          {article.title}
        </h2>
        {article.subtitle && (
          <p className="mt-3 text-sm text-muted-foreground">{article.subtitle}</p>
        )}
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground/90">
          {excerpt(article.content, 240)}
        </p>

        <div className="mt-8 flex items-center gap-3 border-t border-border pt-6">
          {article.author.avatar_url ? (
            <img
              src={article.author.avatar_url}
              alt={article.author.name}
              className="size-9 rounded-full border border-border object-cover"
            />
          ) : (
            <span className="flex size-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
              {article.author.name.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="text-sm text-foreground">{article.author.name}</span>
        </div>
      </div>
    </Link>
  );
}

function WritingCard({ article, locale }: { article: ArticleWithRelations; locale: string }) {
  const photo = article.cover_url ?? article.secondary_photo_url ?? null;

  return (
    <Link
      to="/article/$articleId"
      params={{ articleId: article.id }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/5"
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
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-accent">
          {article.column.name} · {formatDate(article.published_at, locale)}
        </p>
        <h3 className="mt-2 font-display text-xl leading-snug text-foreground transition-colors group-hover:text-accent">
          {article.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground/90">
          {excerpt(article.content, 130)}
        </p>

        <div className="mt-auto flex items-center gap-2 pt-5">
          {article.author.avatar_url ? (
            <img
              src={article.author.avatar_url}
              alt={article.author.name}
              className="size-6 rounded-full border border-border object-cover"
            />
          ) : (
            <span className="flex size-6 items-center justify-center rounded-full bg-accent text-[0.6rem] font-semibold text-accent-foreground">
              {article.author.name.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="text-xs text-muted-foreground">{article.author.name}</span>
        </div>
      </div>
    </Link>
  );
}

function WritingsSkeleton() {
  return (
    <div className="space-y-14">
      <div className="grid animate-pulse overflow-hidden rounded-3xl border border-border sm:grid-cols-2">
        <div className="aspect-[16/11] bg-secondary" />
        <div className="space-y-3 p-10">
          <div className="h-3 w-24 rounded bg-secondary" />
          <div className="h-8 w-4/5 rounded bg-secondary" />
          <div className="h-3 w-full rounded bg-secondary" />
          <div className="h-3 w-2/3 rounded bg-secondary" />
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={cn("animate-pulse overflow-hidden rounded-2xl border border-border")}>
            <div className="aspect-[16/10] bg-secondary" />
            <div className="space-y-2 p-5">
              <div className="h-3 w-20 rounded bg-secondary" />
              <div className="h-5 w-4/5 rounded bg-secondary" />
              <div className="h-3 w-1/2 rounded bg-secondary" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}