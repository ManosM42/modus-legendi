export interface Profile {
  id: string;
  username: string;
  name: string;
  bio: string;
  avatar_url: string | null;
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
}

export interface Blog {
  id: string;
  author_id: string;
  title: string;
  book_title: string;
  book_author: string | null;
  cover_url: string | null;
  content: string;
  rating: number | null;
  status: "draft" | "published" | "hidden";
  created_at: string;
  updated_at: string;
}

export interface BlogWithAuthor extends Blog {
  author: Pick<Profile, "id" | "username" | "name" | "avatar_url">;
}