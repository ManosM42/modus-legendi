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
  const { session, profile } = useAuth();

  if (session) {
    return (
      <Link
        to="/profile/$username"
        params={{ username: profile?.username ?? "" }}
        className={cn(
          "flex items-center gap-3 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-accent",
          focusRing,
          className,
        )}
      >
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.name}
            className="size-8 rounded-full object-cover border border-border"
          />
        ) : (
          <span className="flex size-8 items-center justify-center rounded-full bg-accent text-accent-foreground text-sm font-semibold">
            {profile?.name?.charAt(0).toUpperCase() ?? "?"}
          </span>
        )}
        <span>{profile?.username ?? "Profile"}</span>
      </Link>
    );
  }

  return (
    <Link
      to="/login"
      className={cn(
        "flex min-h-11 items-center border border-border px-4 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
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
  panelRef: React.RefObject<HTMLDivElement>;
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
        "fixed inset-0 z-[9999] flex flex-col bg-background",
        "supports-[backdrop-filter]:bg-background/98 supports-[backdrop-filter]:backdrop-blur-xl",
        "transition-[opacity,transform] duration-300 ease-out",
        open
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-2 opacity-0",
      )}
    >
      <div className="flex items-center justify-end px-5 py-4 sm:px-8">
        <button
          type="button"
          onClick={onClose}
          aria-label={t.nav.close}
          className={cn(
            "flex min-h-11 min-w-11 items-center justify-center border border-border text-foreground transition-colors hover:bg-secondary",
            focusRing,
          )}
        >
          <HamburgerIcon open={true} />
        </button>
      </div>

      <div
        ref={panelRef}
        className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-between overflow-y-auto px-5 pb-10 sm:px-8"
      >
        <nav>
          <ul className="grid gap-2 sm:gap-3">
            {links.map((link, i) => (
              <li
                key={link.to}
                className={cn(
                  "overflow-hidden transition-all duration-300 ease-out",
                  open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
                )}
                style={{ transitionDelay: open ? `${i * 50}ms` : "0ms" }}
              >
                <Link
                  to={link.to}
                  activeOptions={{ exact: link.to === "/" }}
                  aria-current={isActive(link.to) ? "page" : undefined}
                  onClick={onClose}
                  className={cn(
                    "group flex items-baseline gap-4 border-b border-border py-4 font-display text-4xl transition-colors hover:text-accent sm:text-6xl",
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

        <div
          className={cn(
            "mt-8 flex flex-wrap items-center gap-4 transition-all duration-300 ease-out",
            open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
          )}
          style={{ transitionDelay: open ? `${links.length * 50 + 60}ms` : "0ms" }}
        >
          <AuthButton className="sm:hidden" />
          <LanguageSwitcher className="sm:hidden" />
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
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link to="/" aria-label={`${t.brand} — ${t.tagline}`} className={cn("group", focusRing)}>
          <span className="font-display text-xl leading-none tracking-[0.08em] sm:text-2xl">
            {t.brand}
          </span>
          <span className="rule-label mt-1 block text-[0.6rem]">{t.tagline}</span>
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
              "flex min-h-11 min-w-11 items-center justify-center border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
              focusRing,
            )}
          >
            <Search aria-hidden="true" className="size-4" />
          </button>
          <LanguageSwitcher className="hidden sm:flex" />
          <AuthButton className="hidden sm:flex" />
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? t.nav.close : t.nav.openMenu}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            className={cn(
              "flex min-h-11 min-w-11 items-center justify-center border border-border text-foreground transition-colors hover:bg-secondary",
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