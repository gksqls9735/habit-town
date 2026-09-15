export type AppLanguage = 'en' | 'ko';

export type TranslationParams = Record<string, number | string>;

export type Translate = (
  key: string,
  params?: TranslationParams,
  fallback?: string,
) => string;
