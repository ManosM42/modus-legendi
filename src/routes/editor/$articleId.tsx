import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/supabase/client";
import { ArticleForm } from "@/components/ArticleForm";
import type { Article } from "@/lib/types";

export const Route = createFileRoute("/editor/$articleId")({
  component: EditArticlePage,
});

function EditArticlePage() {
  const { articleId } = Route.useParams();
  const { user, profile, loading: authLoading } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!authLoading) void loadArticle();
  }, [authLoading, articleId]);

  const loadArticle = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("id", articleId)
      .single();

    if (error || !data) {
      setNotFound(true);
    } else {
      setArticle(data as Article);
    }
    setLoading(false);
  };

  if (authLoading || loading) return <div className="min-h-screen bg-background" />;

  if (notFound || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <p className="text-sm text-muted-foreground">Το άρθρο δεν βρέθηκε.</p>
      </div>
    );
  }

  const canEdit = article.author_id === user?.id || profile?.role === "admin";

  if (!canEdit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <p className="text-sm text-muted-foreground">
          Δεν μπορείς να επεξεργαστείς αυτό το άρθρο.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/editor"
          className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground hover:text-accent"
        >
          ← Τα άρθρα μου
        </Link>
        <h1 className="mt-4 font-display text-3xl text-foreground">Επεξεργασία άρθρου</h1>

        <div className="mt-10">
          <ArticleForm existingArticle={article} onSaved={(updated) => setArticle(updated)} />
        </div>
      </div>
    </div>
  );
}