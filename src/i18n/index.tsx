import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { dictionaries, locales, type Dictionary, type Locale } from "./translations";

type I18nValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
};

const STORAGE_KEY = "modus-legendi-locale";

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("el");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && (locales as string[]).includes(stored)) {
      setLocaleState(stored as Locale);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const value = useMemo<I18nValue>(
    () => ({ locale, setLocale, t: dictionaries[locale] }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
}

export { locales, localeLabels, localeShort } from "./translations";
export type { Locale } from "./translations";
