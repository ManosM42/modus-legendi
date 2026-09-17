import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useRouterState } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { SearchPanel } from "./SearchPanel";

const links = [
  { to: "/", key: "home" },
  { to: "/magazine", key: "magazine" },
  { to: "/reading-group", key: "readingGroup" },
  { to: "/about", key: "about" },
  { to: "/submissions", key: "submissions" },
  { to: "/contact", key: "contact" },
] as const;

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

function AuthButton({ className }: { className?: string }) {
  const { session, profile, profileLoading, signOut } = useAuth();

  if (session) {
    return (
      <div className={cn("flex flex-col gap-4", className)}>
        {profileLoading ? (
          <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground animate-pulse">
            <div className="size-8 rounded-full bg-border" />
            <span>Loading profile...</span>
          </div>
        ) : profile?.username ? (
          <Link
            to="/profile/$username"
            params={{ username: profile.username }}
            className={cn(
              "flex items-center gap-3 font-mono text-xs uppercase tracking-[0.16em] text-foreground transition-colors hover:text-accent",
              focusRing,
            )}
          >
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.name}
                className="size-8 rounded-full object-cover border border-accent"
              />
            ) : (
              <span className="flex size-8 items-center justify-center rounded-full bg-accent text-accent-foreground text-sm font-semibold">
                {profile.name?.charAt(0).toUpperCase() ?? "?"}
              </span>
            )}
            <span className="max-w-[150px] truncate font-bold">{profile.username}</span>
          </Link>
        ) : (
          <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
            <div className="size-8 rounded-full bg-border" />
            <span>Profile not found</span>
          </div>
        )}
        <button
          onClick={async () => {
            await signOut();
          }}
          className={cn(
            "flex w-full items-center gap-2 text-xs font-mono uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-red-500",
            focusRing,
          )}
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <Link
      to="/login"
      className={cn(
        "flex min-h-10 items-center justify-center border border-border px-4 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
        focusRing,
        className,
      )}
    >
      Sign in
    </Link>
  );
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <span className="relative flex h-4 w-5 flex-col justify-between" aria-hidden="true">
      <span
        className={cn(
          "block h-0.5 w-full origin-center rounded-full bg-current transition-transform duration-300 ease-out",
          open && "translate-y-[7px] rotate-45",
        )}
      />
      <span
        className={cn(
          "block h-0.5 w-full rounded-full bg-current transition-opacity duration-200 ease-out",
          open && "opacity-0",
        )}
      />
      <span
        className={cn(
          "block h-0.5 w-full origin-center rounded-full bg-current transition-transform duration-300 ease-out",
          open && "-translate-y-[7px] -rotate-45",
        )}
      />
    </span>
  );
}

function MenuOverlay({
  open,
  onClose,
  panelRef,
}: {
  open: boolean;
  onClose: () => void;
  panelRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { t } = useI18n();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      id="site-menu"
      role="dialog"
      aria-modal="true"
      aria-label={t.nav.menu}
      className={cn(
        "fixed inset-0 z-[9999] flex justify-end bg-background/40 backdrop-blur-sm transition-opacity duration-300 ease-out",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
      )}
      onClick={onClose}
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "h-full w-full max-w-sm border-l border-border bg-background shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.33,1,0.68,1)]",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <span className="font-display text-lg tracking-tight">{t.brand}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.nav.close}
            className={cn(
              "flex size-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-secondary",
              focusRing,
            )}
          >
            <HamburgerIcon open={true} />
          </button>
        </div>

        <div className="flex h-full flex-col justify-between overflow-y-auto px-6 pb-10 pt-8">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4 w-full">
              <AuthButton className="w-full" />
              <LanguageSwitcher className="w-full" />
            </div>
            <nav>
              <ul className="grid gap-4">
                {links.map((link, i) => (
                  <li
                    key={link.to}
                    className={cn(
                      "overflow-hidden transition-all duration-300 ease-out",
                      open ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0",
                    )}
                    style={{ transitionDelay: open ? `${(i + 2) * 50}ms` : "0ms" }}
                  >
                    <Link
                      to={link.to}
                      activeOptions={{ exact: link.to === "/" }}
                      aria-current={isActive(link.to) ? "page" : undefined}
                      onClick={onClose}
                      className={cn(
                        "group flex items-baseline gap-4 py-3 font-display text-3xl transition-colors hover:text-accent sm:text-4xl",
                        isActive(link.to) ? "text-accent" : "text-foreground",
                        focusRing,
                      )}
                    >
                      <span className="font-mono text-xs text-muted-foreground group-hover:text-accent">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {t.nav[link.key]}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function Navbar() {
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    document.body.style.overflow = "hidden";
    const first = panelRef.current?.querySelector<HTMLElement>("a[href]");
    first?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const closeSearch = () => {
    setSearchOpen(false);
    searchButtonRef.current?.focus();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <Link to="/" aria-label={`${t.brand} — ${t.tagline}`} className={cn("group", focusRing)}>
          <span className="font-display text-lg leading-none tracking-[0.08em] sm:text-xl">
            {t.brand}
          </span>
          <span className="rule-label mt-0.5 block text-[0.55rem]">{t.tagline}</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            ref={searchButtonRef}
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label={t.actions.search}
            aria-haspopup="dialog"
            aria-expanded={searchOpen}
            className={cn(
              "flex min-h-10 min-w-10 items-center justify-center border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
              focusRing,
            )}
          >
            <Search aria-hidden="true" className="size-4" />
          </button>
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? t.nav.close : t.nav.openMenu}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            className={cn(
              "flex min-h-10 min-w-10 items-center justify-center border border-border text-foreground transition-colors hover:bg-secondary",
              focusRing,
            )}
          >
            <HamburgerIcon open={menuOpen} />
          </button>
        </div>
      </div>

      <MenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} panelRef={panelRef} />

      <SearchPanel open={searchOpen} onClose={closeSearch} />
    </header>
  );
}