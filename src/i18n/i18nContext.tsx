import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Language, Translations, getTranslations, LANGUAGE_NAMES, LANGUAGE_FLAGS } from './translations'

interface I18nContextType {
  lang: Language
  t: Translations
  setLang: (lang: Language) => void
  languages: typeof LANGUAGE_NAMES
  flags: typeof LANGUAGE_FLAGS
}

const I18nContext = createContext<I18nContextType>({
  lang: 'en',
  t: getTranslations('en'),
  setLang: () => {},
  languages: LANGUAGE_NAMES,
  flags: LANGUAGE_FLAGS,
})

const LANG_STORAGE_KEY = 'machiyomi-language'

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem(LANG_STORAGE_KEY)
    if (saved && (saved === 'en' || saved === 'tr' || saved === 'ru')) {
      return saved as Language
    }
    return 'ru'
  })

  const setLang = (newLang: Language) => {
    setLangState(newLang)
    localStorage.setItem(LANG_STORAGE_KEY, newLang)
  }

  const t = getTranslations(lang)

  return (
    <I18nContext.Provider value={{ lang, t, setLang, languages: LANGUAGE_NAMES, flags: LANGUAGE_FLAGS }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}
