import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/supabase/client";
import { AdSlotDisplay } from "@/components/Adslotdisplay";
import type { ArticleWithRelations } from "@/lib/types";

export const Route = createFileRoute("/editor/$articleId")({
  component: ArticlePage,
});

function ArticlePage() {
  const { articleId } = Route.useParams();
  const [article, setArticle] = useState<ArticleWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    void loadArticle();
  }, [articleId]);

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

  return (
    <article className="min-h-screen bg-background px-4 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/column/$slug"
          params={{ slug: article.column.slug }}
          className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground hover:text-accent"
        >
          {article.column.name}
        </Link>

        <h1 className="mt-3 font-display text-4xl leading-tight text-foreground sm:text-5xl">
          {article.title}
        </h1>
        {article.subtitle && (
          <p className="mt-3 text-lg text-muted-foreground">{article.subtitle}</p>
        )}

        <Link
          to="/profile/$username"
          params={{ username: article.author.username }}
          className="mt-6 inline-flex items-center gap-2 text-sm text-foreground hover:text-accent"
        >
          {article.author.avatar_url ? (
            <img
              src={article.author.avatar_url}
              alt={article.author.name}
              className="size-8 rounded-full object-cover border border-border"
            />
          ) : (
            <span className="flex size-8 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-semibold">
              {article.author.name.charAt(0).toUpperCase()}
            </span>
          )}
          {article.author.name}
        </Link>

        {article.cover_url && (
          <img
            src={article.cover_url}
            alt=""
            className="mt-8 w-full rounded-lg object-cover"
          />
        )}

        {article.secondary_photo_url && (
          <img
            src={article.secondary_photo_url}
            alt=""
            className="mt-8 w-full rounded-lg object-cover"
          />
        )}

        {/* Rendered as plain text here — swap for your markdown/rich-text
            renderer of choice (e.g. react-markdown) once content format
            is finalized. No comments section anywhere below — per brief. */}
        <div className="prose prose-neutral mt-10 max-w-none whitespace-pre-wrap text-foreground">
          {article.content}
        </div>

        <div className="mt-16">
          <AdSlotDisplay placement="footer" />
        </div>
      </div>
    </article>
  );
}