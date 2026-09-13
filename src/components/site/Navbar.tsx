import { useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Search, X } from "lucide-react";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
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

export function Navbar() {
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const first = menuRef.current?.querySelector<HTMLElement>("a[href]");
    first?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const closeSearch = () => {
    setSearchOpen(false);
    searchButtonRef.current?.focus();
  };

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link to="/" aria-label={`${t.brand} — ${t.tagline}`} className={cn("group", focusRing)}>
          <span className="font-display text-xl leading-none tracking-[0.08em] sm:text-2xl">
            {t.brand}
          </span>
          <span className="rule-label mt-1 block text-[0.6rem]">{t.tagline}</span>
        </Link>

        <nav aria-label={t.a11y.mainNav} className="hidden items-center gap-6 lg:flex">
          <ul className="flex items-center gap-6">
            {links.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  activeOptions={{ exact: link.to === "/" }}
                  aria-current={isActive(link.to) ? "page" : undefined}
                  activeProps={{ className: "text-foreground" }}
                  inactiveProps={{ className: "text-muted-foreground" }}
                  className={cn(
                    "font-mono text-[0.72rem] uppercase tracking-[0.16em] transition-colors hover:text-accent",
                    focusRing,
                  )}
                >
                  {t.nav[link.key]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

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
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? t.nav.close : t.nav.openMenu}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className={cn(
              "flex min-h-11 min-w-11 items-center justify-center border border-border transition-colors hover:bg-secondary lg:hidden",
              focusRing,
            )}
          >
            {menuOpen ? (
              <X aria-hidden="true" className="size-4" />
            ) : (
              <Menu aria-hidden="true" className="size-4" />
            )}
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        ref={menuRef}
        hidden={!menuOpen}
        className={cn("border-t border-border bg-card lg:hidden", menuOpen ? "block" : "hidden")}
      >
        <nav aria-label={t.nav.menu} className="mx-auto w-full max-w-6xl px-5 py-4 sm:px-8">
          <ul className="grid gap-1">
            {links.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  activeOptions={{ exact: link.to === "/" }}
                  aria-current={isActive(link.to) ? "page" : undefined}
                  activeProps={{ className: "text-accent" }}
                  onClick={() => setMenuOpen(false)}
                  className={cn("block border-b border-border py-3 font-display text-2xl", focusRing)}
                >
                  {t.nav[link.key]}
                </Link>
              </li>
            ))}
          </ul>
          <LanguageSwitcher className="mt-5 inline-flex sm:hidden" />
        </nav>
      </div>

      <SearchPanel open={searchOpen} onClose={closeSearch} />
    </header>
  );
}
