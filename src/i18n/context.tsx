'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import enMessages from '@/i18n/locales/en.json';
import ptMessages from '@/i18n/locales/pt.json';

type Locale = 'pt' | 'en';

interface LocaleContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextType | null>(null);

const messages: Record<Locale, Record<string, any>> = {
  en: enMessages,
  pt: ptMessages,
};

const STORAGE_KEY = 'newbeehive_locale';

const getInitialLocale = (): Locale => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'pt') return stored;
  } catch {}
  // Try browser language
  if (typeof navigator !== 'undefined') {
    const lang = navigator.language?.split('-')[0];
    if (lang === 'en') return 'en';
  }
  return 'pt';
};

const resolveKey = (obj: any, key: string): string | undefined => {
  const parts = key.split('.');
  let current = obj;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    current = current[part];
  }
  return typeof current === 'string' ? current : undefined;
};

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {}
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      let value = resolveKey(messages[locale], key);
      if (!value) {
        value = resolveKey(messages.pt, key);
      }
      if (!value) return key;

      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          value = value.replace(`{{${k}}}`, String(v));
        }
      }
      return value;
    },
    [locale]
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = (): LocaleContextType => {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
};

export const useT = () => useLocale().t;
