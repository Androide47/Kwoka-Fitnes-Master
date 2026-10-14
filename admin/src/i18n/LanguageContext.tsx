import { createContext, createElement, useContext, useMemo, useState, type ReactNode } from "react";
import { dictionaries, type Locale, type Messages } from "./messages";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Messages;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);
const STORAGE = "kwoka-admin-locale";

function readLocale(): Locale {
  const saved = localStorage.getItem(STORAGE);
  if (saved === "es" || saved === "en") return saved;
  return navigator.language.toLowerCase().startsWith("es") ? "es" : "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readLocale);
  const setLocale = (next: Locale) => {
    localStorage.setItem(STORAGE, next);
    setLocaleState(next);
    document.documentElement.lang = next;
  };
  const value = useMemo(() => ({ locale, setLocale, t: dictionaries[locale] }), [locale]);
  return createElement(LanguageContext.Provider, { value }, children);
}

export function useI18n() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useI18n must be used within LanguageProvider");
  return ctx;
}
