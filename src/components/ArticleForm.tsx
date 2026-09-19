import { useEffect, useState } from "react";
import { supabase } from "@/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import type { Article, Column } from "@/lib/types";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

interface ArticleFormProps {
  /** Pass an existing article to edit it; omit to create a new one. */
  existingArticle?: Article;
  onSaved?: (article: Article) => void;
}

export function ArticleForm({ existingArticle, onSaved }: ArticleFormProps) {
  const { user } = useAuth();
  const [columns, setColumns] = useState<Column[]>([]);

  const [columnId, setColumnId] = useState(existingArticle?.column_id ?? "");
  const [title, setTitle] = useState(existingArticle?.title ?? "");
  const [subtitle, setSubtitle] = useState(existingArticle?.subtitle ?? "");
  const [content, setContent] = useState(existingArticle?.content ?? "");
  const [videoUrl, setVideoUrl] = useState(existingArticle?.video_url ?? "");
  const [coverUrl, setCoverUrl] = useState(existingArticle?.cover_url ?? "");
  const [coverUploading, setCoverUploading] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    void loadColumns();
  }, []);

  const loadColumns = async () => {
    const { data } = await supabase.from("columns").select("*").order("sort_order");
    setColumns((data as Column[]) ?? []);
    if (!existingArticle && data && data.length > 0) {
      setColumnId((data as Column[])[0].id);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setCoverUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("article-covers")
      .upload(path, file);

    if (!uploadError) {
      const { data } = supabase.storage.from("article-covers").getPublicUrl(path);
      setCoverUrl(data.publicUrl);
    } else {
      setError("Η ανέβασμα εικόνας απέτυχε. Δοκίμασε ξανά.");
    }
    setCoverUploading(false);
  };

  const save = async (status: "draft" | "published") => {
    if (!user) return;
    setError(null);
    setSavedMessage(null);

    if (!title.trim() || !content.trim() || !columnId) {
      setError("Συμπλήρωσε τουλάχιστον τίτλο, στήλη και κείμενο.");
      return;
    }

    setSaving(true);

    const payload = {
      title: title.trim(),
      subtitle: subtitle.trim() || null,
      content,
      video_url: videoUrl.trim() || null,
      cover_url: coverUrl || null,
      column_id: columnId,
      status,
    };

    if (existingArticle) {
      const { data, error: updateError } = await supabase
        .from("articles")
        .update(payload)
        .eq("id", existingArticle.id)
        .select()
        .single();

      if (updateError) {
        setError("Η αποθήκευση απέτυχε. Δοκίμασε ξανά.");
      } else {
        setSavedMessage(status === "published" ? "Δημοσιεύτηκε!" : "Αποθηκεύτηκε ως πρόχειρο.");
        onSaved?.(data as Article);
      }
    } else {
      const { data, error: insertError } = await supabase
        .from("articles")
        .insert({ ...payload, author_id: user.id })
        .select()
        .single();

      if (insertError) {
        setError("Η δημιουργία απέτυχε. Δοκίμασε ξανά.");
      } else {
        setSavedMessage(status === "published" ? "Δημοσιεύτηκε!" : "Αποθηκεύτηκε ως πρόχειρο.");
        onSaved?.(data as Article);
      }
    }

    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="article-column" className="block text-sm font-medium text-foreground">
          Στήλη
        </label>
        <select
          id="article-column"
          value={columnId}
          onChange={(e) => setColumnId(e.target.value)}
          className={cn(
            "mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground",
            focusRing,
          )}
        >
          {columns.map((col) => (
            <option key={col.id} value={col.id}>
              {col.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="article-title" className="block text-sm font-medium text-foreground">
          Τίτλος
        </label>
        <input
          id="article-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={cn(
            "mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground",
            focusRing,
          )}
        />
      </div>

      <div>
        <label htmlFor="article-subtitle" className="block text-sm font-medium text-foreground">
          Υπότιτλος (προαιρετικό)
        </label>
        <input
          id="article-subtitle"
          type="text"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          className={cn(
            "mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground",
            focusRing,
          )}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">Εξώφυλλο (προαιρετικό)</label>
        {coverUrl && (
          <img src={coverUrl} alt="" className="mt-2 h-40 w-full rounded-md object-cover" />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleCoverUpload}
          disabled={coverUploading}
          className="mt-2 text-sm text-muted-foreground"
        />
        {coverUploading && <p className="mt-1 text-xs text-muted-foreground">Ανέβασμα…</p>}
      </div>

      <div>
        <label htmlFor="article-video" className="block text-sm font-medium text-foreground">
          Video URL (προαιρετικό — YouTube ή Vimeo)
        </label>
        <input
          id="article-video"
          type="url"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=…"
          className={cn(
            "mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground",
            focusRing,
          )}
        />
      </div>

      <div>
        <label htmlFor="article-content" className="block text-sm font-medium text-foreground">
          Κείμενο
        </label>
        <textarea
          id="article-content"
          rows={16}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={cn(
            "mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm leading-relaxed text-foreground",
            focusRing,
          )}
        />
        {/* NOTE: no comments UI exists anywhere in the app — per the
            client's explicit requirement, published articles never
            show a comment thread. */}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {savedMessage && <p className="text-sm text-accent">{savedMessage}</p>}

      <div className="flex flex-wrap gap-3 border-t border-border pt-6">
        <button
          onClick={() => save("draft")}
          disabled={saving}
          className={cn(
            "rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-60",
            focusRing,
          )}
        >
          {saving ? "Αποθήκευση…" : "Αποθήκευση ως πρόχειρο"}
        </button>
        <button
          onClick={() => save("published")}
          disabled={saving}
          className={cn(
            "rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60",
            focusRing,
          )}
        >
          {saving ? "Δημοσίευση…" : "Δημοσίευση"}
        </button>
      </div>
    </div>
  );
}