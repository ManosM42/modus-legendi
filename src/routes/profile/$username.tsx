import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Blog, Profile as ProfileType } from "@/lib/types";

export const Route = createFileRoute("/profile/$username")({
  component: ProfilePage,
});

function ProfilePage() {
  const { username } = Route.useParams();
  const { user, refreshProfile } = useAuth();

  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const isOwnProfile = !!user && profile?.id === user.id;

  useEffect(() => {
    if (!username) return;
    void loadProfile();
  }, [username]);

  const loadProfile = async () => {
    setLoading(true);
    setNotFound(false);

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .single();

    if (profileError || !profileData) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setProfile(profileData as ProfileType);
    setName(profileData.name ?? "");
    setBio(profileData.bio ?? "");

    const { data: blogData } = await supabase
      .from("blogs")
      .select("*")
      .eq("author_id", profileData.id)
      .eq("status", "published")
      .order("created_at", { ascending: false });

    setBlogs((blogData as Blog[]) ?? []);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ name, bio })
      .eq("id", profile.id);

    if (!error) {
      setProfile({ ...profile, name, bio });
      setEditing(false);
      await refreshProfile();
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${profile.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (!uploadError) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const avatar_url = `${data.publicUrl}?t=${Date.now()}`;

      await supabase.from("profiles").update({ avatar_url }).eq("id", profile.id);

      setProfile({ ...profile, avatar_url });
      await refreshProfile();
    }
    setUploading(false);
  };

  if (loading) return <PageState message="Loading profile…" />;
  if (notFound || !profile)
    return <PageState message="This reader could not be found." />;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="rounded-2xl border border-border bg-card p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <div className="relative">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.name}
                className="h-24 w-24 rounded-full object-cover border-2 border-accent"
              />
            ) : (
              <div className="h-24 w-24 rounded-full flex items-center justify-center text-3xl font-semibold border-2 border-accent bg-accent text-accent-foreground">
                {profile.name?.charAt(0).toUpperCase() || "?"}
              </div>
            )}

            {isOwnProfile && (
              <label
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full flex items-center justify-center text-xs cursor-pointer border-2 border-background bg-accent text-accent-foreground"
                title="Change avatar"
              >
                {uploading ? "…" : "✎"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="flex-1 w-full">
            {editing ? (
              <div className="space-y-3">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Display name"
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-background text-foreground"
                />
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell readers about yourself…"
                  rows={3}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-background text-foreground"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-lg px-4 py-2 text-sm font-medium bg-accent text-accent-foreground"
                  >
                    {saving ? "Saving…" : "Save"}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="rounded-lg px-4 py-2 text-sm font-medium border border-border text-foreground"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-display font-semibold text-foreground">
                      {profile.name}
                    </h1>
                    <p className="text-sm text-muted-foreground">@{profile.username}</p>
                  </div>
                  {isOwnProfile && (
                    <button
                      onClick={() => setEditing(true)}
                      className="rounded-lg px-4 py-2 text-sm font-medium border border-border text-foreground shrink-0"
                    >
                      Edit profile
                    </button>
                  )}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {profile.bio || "No bio yet."}
                </p>
              </>
            )}
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-lg font-display font-semibold mb-4 text-foreground">
            {blogs.length} {blogs.length === 1 ? "review" : "reviews"}
          </h2>

          {blogs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reviews published yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {blogs.map((blog) => (
                <Link
                  key={blog.id}
                  to="/blog/$blogId"
                  params={{ blogId: blog.id }}
                  className="rounded-xl border border-border bg-card p-4 block hover:shadow-md transition"
                >
                  <h3 className="font-display font-semibold text-foreground">{blog.title}</h3>
                  <p className="text-xs mt-1 text-muted-foreground">
                    on "{blog.book_title}"
                    {blog.book_author ? ` by ${blog.book_author}` : ""}
                  </p>
                  {blog.rating && (
                    <p className="mt-2 text-sm text-accent">
                      {"★".repeat(blog.rating)}
                      {"☆".repeat(5 - blog.rating)}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PageState({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
      {message}
    </div>
  );
}