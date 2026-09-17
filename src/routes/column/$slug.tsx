import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/supabase/client";
import { AdSlotDisplay } from "@/components/Adslotdisplay";
import type { ArticleWithRelations, Column } from "@/lib/types";

export const Route = createFileRoute("/column/$slug")({
  component: ColumnPage,
});

function ColumnPage() {
  const { slug } = Route.useParams();
  const [column, setColumn] = useState<Column | null>(null);
  const [articles, setArticles] = useState<ArticleWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    void loadColumn();
  }, [slug]);

  const loadColumn = async () => {
    setLoading(true);
    setNotFound(false);

    const { data: columnData, error: columnError } = await supabase
      .from("columns")
      .select("*")
      .eq("slug", slug)
      .single();

    if (columnError || !columnData) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setColumn(columnData as Column);

    const { data: articleData } = await supabase
      .from("articles")
      .select("*, author:profiles(id, username, name, avatar_url), column:columns(id, slug, name)")
      .eq("column_id", columnData.id)
      .eq("status", "published")
      .order("published_at", { ascending: false });

    setArticles((articleData as unknown as ArticleWithRelations[]) ?? []);
    setLoading(false);
  };

  if (loading) {
    return <div className="min-h-screen bg-background" />;
  }

  if (notFound || !column) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <p className="text-sm text-muted-foreground">Η στήλη δεν βρέθηκε.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_280px]">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Στήλη
          </p>
          <h1 className="mt-2 font-display text-4xl text-foreground sm:text-5xl">
            {column.name}
          </h1>
          {column.description && (
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {column.description}
            </p>
          )}

          <div className="mt-10 divide-y divide-border border-t border-border">
            {articles.length === 0 ? (
              <p className="py-8 text-sm text-muted-foreground">
                Δεν υπάρχουν ακόμα άρθρα σε αυτή τη στήλη.
              </p>
            ) : (
              articles.map((article) => (
                <Link
                  key={article.id}
                  to="/article/$articleId"
                  params={{ articleId: article.id }}
                  className="group block py-6 transition-colors hover:bg-secondary/40"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-display text-2xl text-foreground group-hover:text-accent">
                        {article.title}
                      </h2>
                      {article.subtitle && (
                        <p className="mt-1 text-sm text-muted-foreground">{article.subtitle}</p>
                      )}
                      <p className="mt-3 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                        {article.author.name}
                        {article.video_url && (
                          <span className="ml-2 rounded-full border border-border px-2 py-0.5 text-[0.6rem] normal-case tracking-normal">
                            Βίντεο
                          </span>
                        )}
                      </p>
                    </div>
                    {article.cover_url && (
                      <img
                        src={article.cover_url}
                        alt=""
                        className="size-20 shrink-0 rounded-md object-cover"
                      />
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <AdSlotDisplay placement="sidebar" />
        </aside>
      </div>
    </div>
  );
}