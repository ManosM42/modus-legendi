import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/supabase/client";
import { cn } from "@/lib/utils";
import type { Article } from "@/lib/types";

export const Route = createFileRoute("/editor/")({
  component: EditorDashboard,
});

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

function EditorDashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const canWrite = profile?.role === "editor" || profile?.role === "admin";

  useEffect(() => {
    if (!authLoading && canWrite) void loadArticles();
  }, [authLoading, canWrite]);

  const loadArticles = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("articles")
      .select("*")
      .eq("author_id", user!.id)
      .order("created_at", { ascending: false });
    setArticles((data as Article[]) ?? []);
    setLoading(false);
  };

  if (authLoading) return <div className="min-h-screen bg-background" />;

  if (!canWrite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <p className="text-sm text-muted-foreground">
          Δεν έχεις δικαίωμα δημοσίευσης άρθρων.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Τα άρθρα μου
            </p>
            <h1 className="mt-2 font-display text-3xl text-foreground">Πίνακας συντάκτη</h1>
          </div>
          <Link
            to="/editor/new"
            className={cn(
              "rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
              focusRing,
            )}
          >
            + Νέο άρθρο
          </Link>
        </div>

        {loading ? (
          <p className="mt-10 text-sm text-muted-foreground">Φόρτωση…</p>
        ) : articles.length === 0 ? (
          <p className="mt-10 text-sm text-muted-foreground">Δεν έχεις γράψει άρθρο ακόμα.</p>
        ) : (
          <ul className="mt-10 divide-y divide-border rounded-xl border border-border bg-card">
            {articles.map((article) => (
              <li key={article.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate font-display text-lg text-foreground">{article.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {article.status === "published" ? "Δημοσιευμένο" : "Πρόχειρο"}
                  </p>
                </div>
                <div className="flex shrink-0 gap-3 text-sm">
                  {article.status === "published" && (
                    <Link
                      to="/article/$articleId"
                      params={{ articleId: article.id }}
                      className="text-muted-foreground hover:text-accent"
                    >
                      Προβολή
                    </Link>
                  )}
                  <Link
                    to="/editor/$articleId"
                    params={{ articleId: article.id }}
                    className="font-medium text-accent hover:underline"
                  >
                    Επεξεργασία
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}