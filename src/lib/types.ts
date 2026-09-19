export interface Profile {
  id: string;
  username: string;
  name: string;
  bio: string;
  avatar_url: string | null;
  role: "notallowed_editors" | "allowed_editors" | "admin";
  created_at: string;
  updated_at: string;
}

export interface Column {
  id: string;
  slug: string;
  name: string;
  name_en: string | null;
  name_de: string | null;
  description: string | null;
  sort_order: number;
  created_at: string;
}

export interface Article {
  id: string;
  author_id: string;
  column_id: string;
  title: string;
  subtitle: string | null;
  cover_url: string | null;
  video_url: string | null;
  content: string;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArticleWithRelations extends Article {
  author: Pick<Profile, "id" | "username" | "name" | "avatar_url">;
  column: Pick<Column, "id" | "slug" | "name">;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  wants_to_submit_text: boolean;
  status: "new" | "read" | "archived";
  created_at: string;
}

export interface AdSlot {
  id: string;
  placement: "sidebar" | "footer";
  image_url: string;
  link_url: string;
  advertiser: string | null;
  active: boolean;
  starts_at: string | null;
  ends_at: string | null;
}