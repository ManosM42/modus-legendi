import { Link } from "@tanstack/react-router";
import { useI18n } from "@/i18n";
import { contactDetails } from "@/data/content";

const explore = [
  { to: "/writings", key: "writings" },
  { to: "/reading-group", key: "readingGroup" },
  { to: "/about", key: "about" },
  { to: "/submissions", key: "submissions" },
  { to: "/contact", key: "contact" },
  { to: "/terms", key: "terms" },
] as const;

export function Footer() {
  const { locale, t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-secondary/40 paper-grain">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-display text-2xl tracking-[0.08em]">{t.brand}</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {t.footer.about}
          </p>
        </div>

        <nav aria-label={t.footer.explore}>
          <p className="rule-label">{t.footer.explore}</p>
          <ul className="mt-4 grid gap-2">
            {explore.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                >
                  {t.nav[item.key]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="rule-label">{t.footer.contactTitle}</p>
          <ul className="mt-4 grid gap-2 text-sm text-muted-foreground">
            <li>{contactDetails.email}</li>
            <li>{contactDetails.submissionsEmail}</li>
            <li>{contactDetails.phone}</li>
            <li>{contactDetails.address[locale]}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="rule-label">
            © {year} {t.brand} · {t.footer.rights}
          </p>
          <p className="rule-label">{t.footer.demoNote}</p>
        </div>
      </div>
    </footer>
  );
}
