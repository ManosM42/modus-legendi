import { Link } from "@tanstack/react-router"
import type { Profile } from "@/lib/types";

interface AuthorLinkProps {
  author: Pick<Profile, "username" | "name" | "avatar_url">;
  size?: "sm" | "md";
}

/**
 * Drop this into any BlogCard / BlogPost header.
 * Clicking the avatar or the name navigates to that author's public profile.
 */
export default function AuthorLink({ author, size = "md" }: AuthorLinkProps) {
  const dimension = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const textSize = size === "sm" ? "text-sm" : "text-base";

  return (
    <Link
      to={`/profile/${author.username}`}
      className="inline-flex items-center gap-2 group"
    >
      {author.avatar_url ? (
        <img
          src={author.avatar_url}
          alt={author.name}
          className={`${dimension} rounded-full object-cover border`}
          style={{ borderColor: "#E4D9C4" }}
        />
      ) : (
        <div
          className={`${dimension} rounded-full flex items-center justify-center font-semibold`}
          style={{ backgroundColor: "#2F4368", color: "#F5EDE0" }}
        >
          {author.name?.charAt(0).toUpperCase() || "?"}
        </div>
      )}
      <span
        className={`${textSize} font-medium group-hover:underline`}
        style={{ color: "#1C1810" }}
      >
        {author.name}
      </span>
    </Link>
  );
}