import { localeLabels, localeShort, locales, useI18n, type Locale } from "@/i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t.nav.language}
      className={cn("flex items-center border border-border", className)}
    >
      {locales.map((code: Locale) => (
        <button
          key={code}
          type="button"
          lang={code}
          onClick={() => setLocale(code)}
          aria-pressed={locale === code}
          className={cn(
            "px-2.5 py-1.5 font-mono text-[0.7rem] tracking-[0.16em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            locale === code
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground",
          )}
        >
          <span aria-hidden="true">{localeShort[code]}</span>
          <span className="sr-only">{localeLabels[code]}</span>
        </button>
      ))}
    </div>
  );
}
