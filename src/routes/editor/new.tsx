import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { ArticleForm } from "@/components/ArticleForm";

export const Route = createFileRoute("/editor/new")({
  component: NewArticlePage,
});

function NewArticlePage() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  const canWrite = profile?.role === "editor" || profile?.role === "admin";

  if (loading) return <div className="min-h-screen bg-background" />;

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
      <div className="mx-auto max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
          Νέο άρθρο
        </p>
        <h1 className="mt-2 font-display text-3xl text-foreground">Γράψε ένα κείμενο</h1>

        <div className="mt-10">
          <ArticleForm
            onSaved={(article) => {
              navigate({ to: "/article/$articleId", params: { articleId: article.id } });
            }}
          />
        </div>
      </div>
    </div>
  );
}