import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { loadLanguage, saveLanguage } from './languageRepository';
import { translations } from './dictionary';
import type { AppLanguage, Translate, TranslationParams } from './types';

type I18nContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  t: Translate;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>('ko');

  useEffect(() => {
    loadLanguage().then((saved) => {
      if (saved) {
        setLanguageState(saved);
      }
    });
  }, []);

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
    saveLanguage(lang);
  };

  const value = useMemo<I18nContextValue>(() => {
    const t: Translate = (key, params, fallback) =>
      interpolate(translations[language][key] ?? translations.ko[key] ?? fallback ?? key, params);

    return { language, setLanguage, t };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useI18n must be used inside I18nProvider.');
  }

  return context;
}

function interpolate(message: string, params: TranslationParams = {}) {
  return Object.entries(params).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    message,
  );
}
